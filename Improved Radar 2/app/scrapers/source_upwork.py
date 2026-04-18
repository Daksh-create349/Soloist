"""
Soloist Agent — Upwork Scraper (via DuckDuckGo Dorking)
Bypasses Cloudflare by searching DuckDuckGo for site:upwork.com jobs.
"""

import httpx
import re
from urllib.parse import unquote

from app.config import JOBS_PER_SOURCE


async def scrape_upwork(skills: list[str]) -> list[dict]:
    """
    Search for Upwork freelance jobs via DuckDuckGo dorking.

    Args:
        skills: List of user skills to search for

    Returns:
        List of job dicts with title, url, description, source
    """
    jobs = []
    skill_terms = " ".join(skills[:3])

    queries = [
        f'site:upwork.com/freelance-jobs/ {skill_terms}',
        f'site:upwork.com/jobs/ {skill_terms} freelance',
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
                    parsed = _parse_results(resp.text)
                    jobs.extend(parsed)
            except Exception as e:
                print(f"[Upwork/DDG] Error: {e}")
                continue

    # Deduplicate
    seen = set()
    unique = []
    for job in jobs:
        if job["url"] not in seen:
            seen.add(job["url"])
            unique.append(job)

    return unique[:JOBS_PER_SOURCE]


def _parse_results(html: str) -> list[dict]:
    """Parse DuckDuckGo HTML results for Upwork job links."""
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

        if "upwork.com" not in url:
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
                "source": "upwork",
                "budget": "",
            })

    return jobs
