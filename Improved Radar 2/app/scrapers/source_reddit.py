"""
Soloist Agent — Reddit Scraper
Uses Reddit's .json API endpoint to bypass HTML bot challenges.
Targets r/forhire and r/freelance for [Hiring] posts.
"""

import httpx
from app.config import JOBS_PER_SOURCE


SUBREDDITS = [
    "forhire",
    "freelance",
    "slavelabour",
    "hiring",
]


async def scrape_reddit(skills: list[str]) -> list[dict]:
    """
    Fetch [Hiring] posts from freelance subreddits using the .json API.
    No authentication needed — just append .json to the URL.

    Args:
        skills: List of user skills to match against post titles/text

    Returns:
        List of job dicts with title, url, description, source
    """
    jobs = []
    skill_set = {s.lower() for s in skills}

    async with httpx.AsyncClient(
        headers={
            "User-Agent": "Soloist-Agent/1.0 (Freelance Gig Discovery Bot)",
        },
        follow_redirects=True,
        timeout=15.0,
    ) as client:
        for subreddit in SUBREDDITS:
            if len(jobs) >= JOBS_PER_SOURCE:
                break
            try:
                url = f"https://www.reddit.com/r/{subreddit}/new.json?limit=25"
                resp = await client.get(url)

                if resp.status_code == 200:
                    data = resp.json()
                    posts = data.get("data", {}).get("children", [])
                    for post in posts:
                        parsed = _parse_post(post, skill_set)
                        if parsed:
                            jobs.append(parsed)
                elif resp.status_code == 429:
                    print(f"[Reddit] Rate limited on r/{subreddit}, skipping")
                    continue
            except Exception as e:
                print(f"[Reddit] Error scraping r/{subreddit}: {e}")
                continue

    return jobs[:JOBS_PER_SOURCE]


def _parse_post(post: dict, skill_set: set) -> dict | None:
    """
    Parse a single Reddit post into a job dict.
    Only returns posts that look like hiring/job postings.
    """
    post_data = post.get("data", {})
    title = post_data.get("title", "")
    selftext = post_data.get("selftext", "")
    permalink = post_data.get("permalink", "")
    flair = (post_data.get("link_flair_text") or "").lower()

    # Only keep hiring-related posts
    title_lower = title.lower()
    is_hiring = any([
        "[hiring]" in title_lower,
        "hiring" in flair,
        "looking for" in title_lower,
        "need a" in title_lower,
        "freelancer wanted" in title_lower,
        "contractor needed" in title_lower,
    ])

    # Skip [For Hire] posts (people looking for work, not offering)
    if "[for hire]" in title_lower:
        return None

    if not is_hiring:
        return None

    # Check for skill relevance (loose match)
    combined = f"{title} {selftext}".lower()
    has_skill_match = any(skill in combined for skill in skill_set)

    # Still include even without direct skill match — the filter node will score
    url = f"https://www.reddit.com{permalink}" if permalink else ""

    return {
        "title": title[:200],
        "url": url,
        "description": selftext[:800],
        "source": "reddit",
        "budget": _extract_budget(selftext),
    }


def _extract_budget(text: str) -> str:
    """Try to extract budget info from the post text."""
    import re
    budget_patterns = [
        r'\$[\d,]+(?:\s*[-–]\s*\$[\d,]+)?(?:\s*/\s*(?:hr|hour|month|project))?',
        r'budget[:\s]+\$?[\d,]+',
        r'(?:pay|rate|compensation)[:\s]+\$?[\d,]+',
    ]
    for pattern in budget_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(0)
    return ""
