"""
Soloist Agent — LangGraph Pipeline Nodes
Three main nodes: Sourcing → Filter → Crafter
Optimized with massive Async concurrency for instantaneous evaluations.
"""

import asyncio
import json
from pathlib import Path

from openai import AsyncOpenAI

from app.config import (
    OPENAI_API_KEY, FILTER_MODEL, CRAFTER_MODEL, EMBEDDING_MODEL,
    MATCH_SCORE_THRESHOLD, PDF_DIR,
)
from app.core.state import AgentState
from app.core.pdf_generator import generate_pdf
from app.core.database import save_job_lead
from app.rag import vector_store
from app.agents.prompts import (
    FILTER_SYSTEM_PROMPT,
    CRAFTER_EMAIL_PROMPT,
    CRAFTER_RESUME_PROMPT,
)
from app.scrapers.source_upwork import scrape_upwork
from app.scrapers.source_linkedin import scrape_linkedin
from app.scrapers.source_reddit import scrape_reddit
from app.scrapers.source_fiverr import scrape_fiverr
from app.scrapers.source_ddg import scrape_ddg
from app.core.llm import safe_chat_create, safe_embed_create

import re

# ── Concurrency Throttling ──────────────────────────────────────────────────
# Gating resource-intensive operations to prevent OOM crashes (Exit 137)
llm_semaphore = asyncio.Semaphore(5)  # Max 5 concurrent LLM calls
pdf_semaphore = asyncio.Semaphore(2)  # Max 2 concurrent PDF generations (Playwright)

def _sanitize_skills(skills: list[str]) -> list[str]:
    """Clean skills to be URL and Dorking safe."""
    safe = []
    for s in skills:
        # Strip special chars that break URLs/Dorks like &, +, ?
        cleaned = re.sub(r'[^a-zA-Z0-9\s-]', '', s).strip()
        if cleaned and len(cleaned.split()) <= 2:
            safe.append(cleaned)
    
    if not safe and skills:
        safe = [re.sub(r'[^a-zA-Z0-9\s-]', '', skills[0]).strip()]
    return safe or ["developer", "freelance", "software"]

async def sourcing_node(state: AgentState) -> dict:
    """
    The Sourcing Node — triggers all 5 scrapers concurrently.
    Collects raw job leads from Upwork, LinkedIn, Reddit, Fiverr, and DDG.
    """
    skills = state.get("user_skills", [])
    errors = state.get("errors", [])

    if not skills:
        errors.append("No skills extracted from resume — scraping with generic queries")
        
    search_skills = _sanitize_skills(skills)

    print(f"\n🔍 [Sourcing] Searching across 5 sources with sanitized skills: {search_skills[:5]}")

    results = await asyncio.gather(
        _safe_scrape("Upwork", scrape_upwork, search_skills),
        _safe_scrape("LinkedIn", scrape_linkedin, search_skills),
        _safe_scrape("Reddit", scrape_reddit, search_skills),
        _safe_scrape("Fiverr", scrape_fiverr, search_skills),
        _safe_scrape("DuckDuckGo", scrape_ddg, search_skills),
        return_exceptions=True,
    )

    raw_jobs = []
    for result in results:
        if isinstance(result, tuple):
            source_name, jobs, error = result
            if error:
                errors.append(f"{source_name}: {error}")
                print(f"  ⚠️  {source_name}: {error}")
            else:
                raw_jobs.extend(jobs)
                print(f"  ✅ {source_name}: {len(jobs)} jobs found")
        elif isinstance(result, Exception):
            errors.append(f"Scraper exception: {str(result)}")

    print(f"\n📊 Total raw jobs collected: {len(raw_jobs)}")

    return {
        "raw_jobs": raw_jobs,
        "errors": errors,
        "status": "filtering",
    }


async def _safe_scrape(name: str, scraper_fn, skills: list[str]) -> tuple:
    """Wrapper to catch errors from individual scrapers."""
    try:
        jobs = await scraper_fn(skills)
        return (name, jobs, None)
    except Exception as e:
        return (name, [], str(e))


async def _score_job(job: dict, resume_text: str) -> tuple[dict | None, str | None]:
    """Scores a single job against the resume using Async RAG."""
    try:
        job_desc = f"{job.get('title', '')} {job.get('description', '')}"

        # Async Vector DB Context Retrieval
        try:
            resp = await safe_embed_create(model=EMBEDDING_MODEL, input=[job_desc[:500]])
            query_embedding = resp.data[0].embedding
            rag_results = await asyncio.to_thread(vector_store.query, query_embedding, n_results=3)
            resume_context = "\n---\n".join(rag_results.get("documents", [[]])[0])
        except Exception:
            resume_context = resume_text[:1000]

        async with llm_semaphore:
            response = await safe_chat_create(
                model=FILTER_MODEL,
                messages=[
                    {"role": "system", "content": FILTER_SYSTEM_PROMPT},
                    {
                        "role": "user",
                        "content": (
                            f"JOB POSTING:\nTitle: {job.get('title', 'N/A')}\n"
                            f"Source: {job.get('source', 'N/A')}\n"
                            f"Description: {job.get('description', 'No description')}\n\n"
                            f"FREELANCER'S RELEVANT RESUME EXCERPTS:\n{resume_context}"
                        ),
                    },
                ],
                temperature=0,
                response_format={"type": "json_object"},
            )
    
            result = json.loads(response.choices[0].message.content)
            score = result.get("match_score", 0)
            is_freelance = result.get("is_freelance", True)
    
            print(f"  {'✅' if score >= MATCH_SCORE_THRESHOLD else '❌'} "
                  f"[{score:3d}] {job.get('source', '?'):10s} | {job.get('title', '?')[:60]}")
    
            if score >= MATCH_SCORE_THRESHOLD and is_freelance:
                job["match_score"] = score
                job["reasoning"] = result.get("reasoning", "")
                return job, None
            return None, None
    except Exception as e:
        return None, str(e)


async def filter_node(state: AgentState) -> dict:
    """
    The Filter Node — Evaluates all raw jobs concurrently.
    """
    raw_jobs = state.get("raw_jobs", [])
    errors = state.get("errors", [])

    if not raw_jobs:
        errors.append("No raw jobs to filter")
        return {"filtered_jobs": [], "errors": errors, "status": "crafting"}

    print(f"\n🔍 [Filter] Evaluating {len(raw_jobs)} jobs concurrently...")

    tasks = [_score_job(job, state.get("resume_text", "")) for job in raw_jobs]
    results = await asyncio.gather(*tasks)

    filtered_jobs = []
    for job, error in results:
        if job:
            filtered_jobs.append(job)
        if error:
            errors.append(f"Filter error: {error}")

    print(f"\n📊 Filtered: {len(filtered_jobs)}/{len(raw_jobs)} jobs passed (threshold: {MATCH_SCORE_THRESHOLD})")

    return {
        "filtered_jobs": filtered_jobs,
        "errors": errors,
        "status": "crafting",
    }


async def _craft_job(job: dict, resume_text: str, index: int, total_jobs: int) -> tuple[dict | None, str | None]:
    """Generates email and resume concurrently for a single job."""
    try:
        job_title = job.get("title", "Untitled")
        job_desc = job.get("description", "")
        source = job.get("source", "unknown")

        # Async Vector DB Context Retrieval
        try:
            query_text_combined = f"{job_title} {job_desc}"
            resp = await safe_embed_create(model=EMBEDDING_MODEL, input=[query_text_combined[:500]])
            query_embedding = resp.data[0].embedding
            rag_results = await asyncio.to_thread(vector_store.query, query_embedding, n_results=3)
            resume_context = "\n---\n".join(rag_results.get("documents", [[]])[0])
        except Exception:
            resume_context = resume_text[:1500]

        # Generate outreach email and resume concurrently with gating
        async with llm_semaphore:
            email_task = safe_chat_create(
                model=CRAFTER_MODEL,
                messages=[
                    {
                        "role": "user",
                        "content": CRAFTER_EMAIL_PROMPT.format(
                            job_title=job_title,
                            job_description=job_desc,
                            resume_context=resume_context,
                        ),
                    },
                ],
                temperature=0.7,
            )

            resume_task = safe_chat_create(
                model=CRAFTER_MODEL,
                messages=[
                    {
                        "role": "user",
                        "content": CRAFTER_RESUME_PROMPT.format(
                            job_title=job_title,
                            job_description=job_desc,
                            resume_text=resume_text[:4000],
                        ),
                    },
                ],
                temperature=0.3,
            )

            email_response, resume_response = await asyncio.gather(email_task, resume_task)

        email_draft = email_response.choices[0].message.content.strip()
        resume_markdown = resume_response.choices[0].message.content.strip()

        # Clean markdown wrapper blocks
        if resume_markdown.startswith("```markdown"):
            resume_markdown = resume_markdown[11:]
        elif resume_markdown.startswith("```"):
            resume_markdown = resume_markdown[3:]
        if resume_markdown.endswith("```"):
            resume_markdown = resume_markdown[:-3]
        resume_markdown = resume_markdown.strip()

        # Generate PDF asynchronously using Playwright with gating
        job_id = f"job_{index+1}_{source}"
        pdf_path = PDF_DIR / f"{job_id}.pdf"
        try:
            async with pdf_semaphore:
                actual_path = await generate_pdf(resume_markdown, pdf_path)
            pdf_path_str = str(actual_path)
        except Exception as pdf_err:
            print(f"  ⚠️  PDF generation failed for {job_id}: {pdf_err}")
            pdf_path_str = ""

        crafted_job = {
            **job,
            "email_draft": email_draft,
            "resume_markdown": resume_markdown,
            "resume_pdf_path": pdf_path_str,
            "status": "crafted",
        }

        # Persist
        await asyncio.to_thread(save_job_lead, crafted_job)
        print(f"  ✅ [{index+1}/{total_jobs}] {job_title[:50]}... — email + resume ready")
        return crafted_job, None

    except Exception as e:
        print(f"  ❌ [{index+1}/{total_jobs}] Error: {e}")
        return None, str(e)


async def crafter_node(state: AgentState) -> dict:
    """
    The Crafter Node — generates tailored email + resume PDF.
    Fully optimized to generate all proposals concurrently.
    """
    filtered_jobs = state.get("filtered_jobs", [])
    resume_text = state.get("resume_text", "")
    errors = state.get("errors", [])

    if not filtered_jobs:
        errors.append("No filtered jobs to craft proposals for")
        return {"crafted_jobs": [], "errors": errors, "status": "complete"}

    print(f"\n✍️  [Crafter] Generating proposals concurrently for {len(filtered_jobs)} jobs...")

    tasks = [_craft_job(job, resume_text, i, len(filtered_jobs)) for i, job in enumerate(filtered_jobs)]
    results = await asyncio.gather(*tasks)

    crafted_jobs = []
    for job, error in results:
        if job:
            crafted_jobs.append(job)
        if error:
            errors.append(f"Crafter error: {error}")

    print(f"\n📊 Crafted: {len(crafted_jobs)}/{len(filtered_jobs)} proposals generated")

    return {
        "crafted_jobs": crafted_jobs,
        "errors": errors,
        "status": "complete",
    }


async def strategist_node(state: AgentState) -> dict:
    """
    The Strategist Node — Triggers on 0 matching search results.
    Reflects on what went wrong and intelligently generates orthogonal search parameters.
    """
    from app.core.llm import safe_chat_create
    import json
    
    current_skills = state.get("user_skills", [])
    retry_count = state.get("retry_count", 0)
    
    prompt = (
        "You are an AI Search Strategist. "
        "Our previous search for freelance gigs using these highly specific keywords completely failed to yield any matching results on job boards: "
        f"{json.dumps(current_skills)}\n\n"
        "Generate a COMPLETELY NEW, MUCH BROADER array of exactly 3 search keywords/technologies to pivot the search. "
        "For example, if 'CrewAI' and 'LangGraph' failed, step back to broad overarching nouns like 'Python AI' or 'Software Engineer' or 'Machine Learning'. "
        "Do NOT use special characters like '&'. "
        "Return ONLY a JSON object with a key 'skills' containing the array of 3 strings."
    )
    
    try:
        response = await safe_chat_create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.8
        )
        data = json.loads(response.choices[0].message.content)
        new_skills = data.get("skills", ["Software Engineer", "Developer", "Remote"])
    except Exception as e:
        print(f"[Strategist] Generation error: {e}")
        new_skills = ["Software Engineer", "Developer", "Remote"]
        
    print(f"\n🧠 [Strategist] Pivoting search to new generic keywords (Retry {retry_count+1}/2): {new_skills}")
        
    return {
        "user_skills": new_skills,
        "retry_count": retry_count + 1,
        "status": "sourcing"
    }
