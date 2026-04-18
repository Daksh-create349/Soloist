"""
Soloist Agent — Core LLM API Wrapper
Provides Semaphore-gated LLM generation and embeddings to prevent 429 Rate Limits globally.
"""

import asyncio
import openai
from openai import AsyncOpenAI
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type

from app.config import OPENAI_API_KEY

aclient = AsyncOpenAI(api_key=OPENAI_API_KEY)

# Global API Rate Limiter
_sem = asyncio.Semaphore(2)

@retry(
    wait=wait_exponential(multiplier=1, min=4, max=40),
    stop=stop_after_attempt(6),
    retry=retry_if_exception_type(openai.RateLimitError)
)
async def safe_chat_create(**kwargs):
    async with _sem:
        return await aclient.chat.completions.create(**kwargs)


@retry(
    wait=wait_exponential(multiplier=1, min=4, max=40),
    stop=stop_after_attempt(6),
    retry=retry_if_exception_type(openai.RateLimitError)
)
async def safe_embed_create(**kwargs):
    async with _sem:
        return await aclient.embeddings.create(**kwargs)
