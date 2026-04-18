"""
Soloist Agent — LangGraph Workflow Definition
Defines the State Machine: sourcing → filter → (conditional) crafter / strategist → END
"""

import asyncio
from langgraph.graph import StateGraph, END

from app.core.state import AgentState
from app.agents.nodes import sourcing_node, filter_node, crafter_node, strategist_node

def route_after_filter(state: AgentState) -> str:
    """Intelligently routes the graph based on evaluation results."""
    # If 0 jobs passed the filter, we engage the strategist to pivot the search!
    if len(state.get("filtered_jobs", [])) == 0:
        # Prevent infinite loops by restricting to 2 retries
        if state.get("retry_count", 0) >= 2:
            return "end"
        return "strategist"
    return "crafter"


def build_workflow() -> StateGraph:
    """
    Build and compile the LangGraph pipeline with Conditional Reflection.
    """
    workflow = StateGraph(AgentState)

    # Add nodes
    workflow.add_node("sourcing", sourcing_node)
    workflow.add_node("filter", filter_node)
    workflow.add_node("strategist", strategist_node)
    workflow.add_node("crafter", crafter_node)

    # Define cyclic routing edges
    workflow.set_entry_point("sourcing")
    workflow.add_edge("sourcing", "filter")
    
    workflow.add_conditional_edges(
        "filter", 
        route_after_filter, 
        {
            "strategist": "strategist", 
            "crafter": "crafter",
            "end": END
        }
    )
    workflow.add_edge("strategist", "sourcing")
    workflow.add_edge("crafter", END)

    return workflow.compile()


async def run_pipeline(resume_text: str, user_skills: list[str]) -> dict:
    """
    Execute the full pipeline with the given resume data.
    """
    graph = build_workflow()

    initial_state: AgentState = {
        "resume_text": resume_text,
        "resume_chunks": [],
        "user_skills": user_skills,
        "raw_jobs": [],
        "filtered_jobs": [],
        "crafted_jobs": [],
        "errors": [],
        "status": "sourcing",
        "retry_count": 0,
    }

    print("\n" + "=" * 60)
    print("🚀 SOLOIST OPPORTUNITY ENGINE — Cognitive Pipeline Started")
    print("=" * 60)

    # LangGraph invocation (async)
    result = await graph.ainvoke(initial_state)

    print("\n" + "=" * 60)
    print(f"✅ Pipeline Complete — {len(result.get('crafted_jobs', []))} proposals ready")
    if result.get("errors"):
        print(f"⚠️  {len(result['errors'])} warnings/errors logged")
    print("=" * 60 + "\n")

    return result
