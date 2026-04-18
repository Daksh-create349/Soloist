"""
Soloist Agent — Fiverr Scraper
Uses DuckDuckGo dorking + Playwright stealth for Fiverr gig discovery.
"""

import re
from urllib.parse import unquote

import httpx

from app.config import JOBS_PER_SOURCE
from app.scrapers.browser import stealth_browser


async def scrape_fiverr(skills: list[str]) -> list[dict]:
    """
    Search for Fiverr buyer requests / gigs via DuckDuckGo dorking.
    Falls back to Playwright direct search if DDG yields few results.

    Args:
        skills: List of user skills to search for

    Returns:
        List of job dicts
    """
    jobs = []

    # Strategy 1: DuckDuckGo dorking
    try:
        ddg_jobs = await _scrape_via_ddg(skills)
        jobs.extend(ddg_jobs)
    except Exception as e:
        print(f"[Fiverr/DDG] Dorking failed: {e}")

    # Strategy 2: Direct Fiverr search via Playwright (if DDG didn't yield enough)
    if len(jobs) < JOBS_PER_SOURCE:
        try:
            playwright_jobs = await _scrape_direct(skills)
            jobs.extend(playwright_jobs)
        except Exception as e:
            print(f"[Fiverr/Playwright] Direct scraping failed: {e}")

    # Deduplicate
    seen = set()
    unique = []
    for job in jobs:
        if job["url"] not in seen:
            seen.add(job["url"])
            unique.append(job)

    return unique[:JOBS_PER_SOURCE]


async def _scrape_via_ddg(skills: list[str]) -> list[dict]:
    """Search DuckDuckGo for Fiverr gig listings."""
    jobs = []
    skill_terms = " ".join(skills[:3])

    queries = [
        f'site:fiverr.com {skill_terms}',
        f'site:fiverr.com/categories {skill_terms}',
    ]

    async with httpx.AsyncClient(
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": "https://duckduckgo.com/",
        },
        follow_redirects=True,
        timeout=20.0,
    ) as client:
        for query in queries:
            if len(jobs) >= JOBS_PER_SOURCE:
                break
            try:
                resp = await client.get(
                    "https://html.duckduckgo.com/html/",
                    params={"q": query},
                )
                if resp.status_code == 200:
                    parsed = _parse_ddg_results(resp.text)
                    jobs.extend(parsed)
            except Exception as e:
                print(f"[Fiverr/DDG] Error: {e}")
                continue

    return jobs


async def _scrape_direct(skills: list[str]) -> list[dict]:
    """Try scraping Fiverr search directly via Playwright stealth."""
    jobs = []
    skill_query = "+".join(skills[:3])

    try:
        async with stealth_browser() as context:
            page = await context.new_page()
            search_url = f"https://www.fiverr.com/search/gigs?query={skill_query}&source=main_banner"
            await page.goto(search_url, wait_until="domcontentloaded", timeout=20000)
            await page.wait_for_timeout(3000)

            import json
            from markdownify import markdownify
            from app.core.llm import safe_chat_create

            # AI Zero-Failure DOM Parsing
            html_content = await page.content()
            markdown_text = markdownify(html_content, strip=['script', 'style', 'img', 'noscript'])
            
            prompt = (
                "You are a web scraper. Extract gig postings from this Markdown representation of a Fiverr search page. "
                "Return ONLY a JSON object with a single key 'jobs' containing an array of objects. "
                "Each object must have exactly these keys: "
                '"title" (string, the gig title), '
                '"url" (string, the URL from the markdown link), '
                '"description" (string, a brief context or snippet), '
                '"source" (string, "fiverr"), '
                '"budget" (string, budget or starting price if mentioned, otherwise empty string). '
                "If no distinct gigs are found, return {\"jobs\": []}. "
                f"Limit to max {JOBS_PER_SOURCE} jobs. "
                f"\n\nPAGE MARKDOWN:\n{markdown_text[:20000]}"
            )
            
            try:
                response = await safe_chat_create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": prompt}],
                    response_format={"type": "json_object"},
                    temperature=0
                )
    
                data = json.loads(response.choices[0].message.content)
                extracted_jobs = data.get("jobs", [])
                for job in extracted_jobs:
                    href = job.get("url", "")
                    if href and not href.startswith("http"):
                        job["url"] = f"https://www.fiverr.com{href}" if href.startswith("/") else f"https://www.fiverr.com/{href}"
                    jobs.append(job)
            except Exception as e:
                print(f"[Fiverr] AI Extraction Error: {e}")

            await page.close()
    except Exception as e:
        print(f"[Fiverr] Playwright fallback error: {e}")

    return jobs


def _parse_ddg_results(html: str) -> list[dict]:
    """Parse DuckDuckGo HTML results for Fiverr links."""
    jobs = []

    link_pattern = re.compile(
        r'<a[^>]*class=["\']result__a["\'][^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>',
        re.DOTALL | re.IGNORECASE,
    )

    snippet_pattern = re.compile(
        r'<a[^>]*class=["\']result__snippet["\'][^>]*>(.*?)</a>',
        re.DOTALL | re.IGNORECASE,
    )

    links = link_pattern.findall(html)
    snippets = snippet_pattern.findall(html)

    for i, (url, title) in enumerate(links):
        if "uddg=" in url:
            url_match = re.search(r'uddg=([^&]+)', url)
            if url_match:
                url = unquote(url_match.group(1))

        url = unquote(url).strip()
        if "fiverr.com" not in url:
            continue

        title = re.sub(r"<[^>]+>", "", title).strip()
        snippet = ""
        if i < len(snippets):
            snippet = re.sub(r"<[^>]+>", "", snippets[i]).strip()

        if title and url:
            jobs.append({
                "title": title[:200],
                "url": url,
                "description": snippet[:500],
                "source": "fiverr",
                "budget": "",
            })

    return jobs
