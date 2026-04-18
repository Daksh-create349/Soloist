"""
Soloist Agent — LinkedIn Scraper
Uses cookie-injected Playwright for authenticated LinkedIn job search.
Falls back to DuckDuckGo dorking if no session cookie is available.
"""

import re
from urllib.parse import unquote

import httpx

from app.config import LINKEDIN_SESSION_COOKIE, JOBS_PER_SOURCE
from app.scrapers.browser import linkedin_browser


async def scrape_linkedin(skills: list[str]) -> list[dict]:
    """
    Scrape LinkedIn for contract/freelance jobs.

    Strategy 1: If LINKEDIN_SESSION_COOKIE is set, use Playwright with
                cookie injection to access LinkedIn Jobs (Contract filter).
    Strategy 2: Fallback to DuckDuckGo dorking (site:linkedin.com/jobs).

    Args:
        skills: List of user skills for search queries

    Returns:
        List of job dicts
    """
    if LINKEDIN_SESSION_COOKIE:
        try:
            return await _scrape_authenticated(skills)
        except Exception as e:
            print(f"[LinkedIn] Authenticated scraping failed: {e}")
            print("[LinkedIn] Falling back to DDG dorking...")

    return await _scrape_via_ddg(skills)


async def _scrape_authenticated(skills: list[str]) -> list[dict]:
    """Scrape LinkedIn using authenticated session cookie via Playwright."""
    jobs = []
    skill_query = " ".join(skills[:3])

    async with linkedin_browser(LINKEDIN_SESSION_COOKIE) as context:
        page = await context.new_page()

        # Navigate to LinkedIn Jobs with Contract filter (f_WT=2)
        search_url = (
            f"https://www.linkedin.com/jobs/search/"
            f"?keywords={skill_query}"
            f"&f_WT=2"  # Contract/Freelance filter
            f"&sortBy=DD"  # Sort by date
        )

        import json
        from markdownify import markdownify
        from app.core.llm import safe_chat_create

        await page.goto(search_url, wait_until="domcontentloaded", timeout=20000)
        await page.wait_for_timeout(3000)  # Let content load

        # AI Zero-Failure DOM Parsing
        html_content = await page.content()
        markdown_text = markdownify(html_content, strip=['script', 'style', 'img', 'noscript'])
        
        prompt = (
            "You are a web scraper. Extract job postings from this Markdown representation of a LinkedIn job board search page. "
            "Return ONLY a JSON object with a single key 'jobs' containing an array of objects. "
            "Each object must have exactly these keys: "
            '"title" (string, the job title and company if available), '
            '"url" (string, the URL from the markdown link. PREFER links containing "/jobs/view/"), '
            '"description" (string, a brief context or snippet), '
            '"source" (string, "linkedin"), '
            '"budget" (string, budget or hourly rate if mentioned, otherwise empty string). '
            "If no distinct jobs are found, return {\"jobs\": []}. "
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
                    job["url"] = f"https://www.linkedin.com{href}" if href.startswith("/") else f"https://www.linkedin.com/{href}"
                jobs.append(job)
                
        except Exception as e:
            print(f"[LinkedIn] AI Extraction Error: {e}")

        await page.close()

    return jobs[:JOBS_PER_SOURCE]


async def _scrape_via_ddg(skills: list[str]) -> list[dict]:
    """Fallback: Search DuckDuckGo for LinkedIn job postings."""
    jobs = []
    skill_terms = " ".join(skills[:3])

    queries = [
        f'site:linkedin.com/jobs {skill_terms} contract freelance',
        f'site:linkedin.com/jobs {skill_terms} remote developer',
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
                print(f"[LinkedIn/DDG] Error: {e}")
                continue

    return jobs[:JOBS_PER_SOURCE]


def _parse_ddg_results(html: str) -> list[dict]:
    """Parse DuckDuckGo HTML results for LinkedIn job links."""
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
        if "linkedin.com" not in url:
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
                "source": "linkedin",
                "budget": "",
            })

    return jobs
