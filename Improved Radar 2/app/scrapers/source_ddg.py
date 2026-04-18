"""
Soloist Agent — DuckDuckGo Search Scraper
Generic niche gig discovery through DuckDuckGo HTML search.
"""

import httpx
import re
from urllib.parse import unquote

from app.config import JOBS_PER_SOURCE


async def scrape_ddg(skills: list[str]) -> list[dict]:
    """
    Search DuckDuckGo HTML for niche freelance gigs.

    Args:
        skills: List of user skills to build search queries

    Returns:
        List of job dicts with title, url, description, source
    """
    jobs = []
    skill_query = " ".join(skills[:3])
    queries = [
        f'{skill_query} freelance gig project remote',
        f'{skill_query} contract developer needed hiring',
        f'{skill_query} freelancer looking for help',
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
                    parsed = _parse_ddg_html(resp.text)
                    jobs.extend(parsed)
            except Exception as e:
                print(f"[DDG] Error searching '{query[:50]}...': {e}")
                continue

    # Deduplicate by URL
    seen = set()
    unique = []
    for job in jobs:
        if job["url"] not in seen:
            seen.add(job["url"])
            unique.append(job)

    return unique[:JOBS_PER_SOURCE]


def _parse_ddg_html(html: str) -> list[dict]:
    """Parse DuckDuckGo HTML results into job dicts."""
    jobs = []

    # DuckDuckGo HTML uses <a class="result__a" href="...">
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
        # Decode DDG redirect URL
        if "uddg=" in url:
            url_match = re.search(r'uddg=([^&]+)', url)
            if url_match:
                url = unquote(url_match.group(1))

        url = unquote(url).strip()

        # Skip DDG internal
        if "duckduckgo.com" in url:
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
                "source": "duckduckgo",
                "budget": "",
            })

    return jobs
