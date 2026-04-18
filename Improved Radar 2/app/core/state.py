"""
Soloist Agent — LangGraph State Definition
TypedDict that flows through the entire agentic pipeline.
"""

from typing import TypedDict


class JobData(TypedDict, total=False):
    """Structure for a single job opportunity flowing through the pipeline."""
    title: str
    source: str
    url: str
    description: str
    budget: str
    match_score: float
    email_draft: str
    resume_markdown: str
    resume_pdf_path: str


class AgentState(TypedDict, total=False):
    """
    The shared state that flows through the LangGraph pipeline:
      sourcing → filter → crafter → END
    """
    # User's resume data
    resume_text: str
    resume_chunks: list[str]
    user_skills: list[str]

    # Pipeline data
    raw_jobs: list[JobData]
    filtered_jobs: list[JobData]
    crafted_jobs: list[JobData]

    # Metadata
    errors: list[str]
    status: str  # "sourcing", "filtering", "crafting", "complete", "error"
    retry_count: int
