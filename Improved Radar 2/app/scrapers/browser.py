"""
Soloist Agent — Playwright Stealth Browser Factory
Shared browser context with anti-detection measures and cookie injection.
"""

import asyncio
from contextlib import asynccontextmanager
from playwright.async_api import async_playwright, Browser, BrowserContext


@asynccontextmanager
async def stealth_browser(headless: bool = True):
    """
    Yield a Playwright browser context with stealth anti-detection applied.
    Spoofs navigator properties to avoid WebDriver detection.
    """
    pw = await async_playwright().start()
    browser = await pw.chromium.launch(
        headless=headless,
        args=[
            "--disable-blink-features=AutomationControlled",
            "--no-sandbox",
            "--disable-dev-shm-usage",
        ],
    )

    context = await browser.new_context(
        user_agent=(
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/122.0.0.0 Safari/537.36"
        ),
        viewport={"width": 1920, "height": 1080},
        locale="en-US",
        timezone_id="America/New_York",
    )

    # Inject stealth scripts to mask WebDriver status
    await context.add_init_script("""
        // Override navigator.webdriver
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });

        // Override chrome runtime
        window.chrome = { runtime: {} };

        // Override permissions query
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters) =>
            parameters.name === 'notifications'
                ? Promise.resolve({ state: Notification.permission })
                : originalQuery(parameters);

        // Override plugins length
        Object.defineProperty(navigator, 'plugins', {
            get: () => [1, 2, 3, 4, 5],
        });

        // Override languages
        Object.defineProperty(navigator, 'languages', {
            get: () => ['en-US', 'en'],
        });
    """)

    try:
        yield context
    finally:
        await context.close()
        await browser.close()
        await pw.stop()


@asynccontextmanager
async def linkedin_browser(session_cookie: str, headless: bool = True):
    """
    Yield a Playwright browser context with LinkedIn session cookie injected.
    """
    async with stealth_browser(headless=headless) as context:
        if session_cookie:
            await context.add_cookies([
                {
                    "name": "li_at",
                    "value": session_cookie,
                    "domain": ".linkedin.com",
                    "path": "/",
                    "httpOnly": True,
                    "secure": True,
                }
            ])
        yield context
