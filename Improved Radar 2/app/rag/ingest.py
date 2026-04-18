"""
Soloist Agent — Resume Ingestion Pipeline
Parses → Chunks → Embeds → Stores in ChromaDB.
"""

import hashlib
from openai import OpenAI

from app.config import OPENAI_API_KEY, EMBEDDING_MODEL
from app.rag.document_parser import parse_file
from app.rag import vector_store

client = OpenAI(api_key=OPENAI_API_KEY)


def chunk_text(text: str, chunk_size: int = 150, overlap: int = 30) -> list[str]:
    """
    Split text into overlapping chunks by word count.

    Args:
        text: The full resume text
        chunk_size: Number of words per chunk
        overlap: Number of overlapping words between chunks

    Returns:
        List of text chunks
    """
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        if chunk.strip():
            chunks.append(chunk)
        start = end - overlap
    return chunks


def embed_texts(texts: list[str]) -> list[list[float]]:
    """
    Generate embeddings for a list of texts using OpenAI's embedding model.

    Args:
        texts: List of text strings to embed

    Returns:
        List of embedding vectors
    """
    response = client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=texts,
    )
    return [item.embedding for item in response.data]


def ingest_resume(filepath: str) -> dict:
    """
    Full ingestion pipeline: parse file → chunk → embed → store in ChromaDB.

    Args:
        filepath: Path to the resume file (PDF, DOCX, or TXT)

    Returns:
        Dict with ingestion stats (chunks_count, text_length)
    """
    # 1. Parse the document
    text = parse_file(filepath)
    if not text.strip():
        raise ValueError("Document appears to be empty — no text extracted.")

    # 2. Clear previous resume data and chunk
    vector_store.clear_collection()
    chunks = chunk_text(text)

    # 3. Generate embeddings
    embeddings = embed_texts(chunks)

    # 4. Create unique IDs for each chunk
    ids = [
        f"chunk_{hashlib.md5(chunk.encode()).hexdigest()[:12]}_{i}"
        for i, chunk in enumerate(chunks)
    ]

    # 5. Store in ChromaDB
    vector_store.add_documents(chunks=chunks, embeddings=embeddings, ids=ids)

    return {
        "text_length": len(text),
        "chunks_count": len(chunks),
        "resume_text": text,
    }


def extract_skills(text: str) -> list[str]:
    """
    Extract key skills from resume text.
    Uses GPT if available, falls back to local keyword matching if rate-limited.
    """
    # Try AI extraction first
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Extract the top 10 professional skills and technologies from this resume. "
                        "Return ONLY a JSON object with a single 'skills' key containing an array of strings. "
                        'Example: {"skills": ["Python", "Machine Learning", "FastAPI"]}. '
                        "Focus on marketable, specific skills that would appear in freelance job postings."
                    ),
                },
                {"role": "user", "content": text[:3000]},
            ],
            temperature=0,
            response_format={"type": "json_object"}
        )

        import json
        data = json.loads(response.choices[0].message.content.strip())
        skills = data.get("skills", [])
        if isinstance(skills, list) and len(skills) > 0:
            return skills
    except Exception as e:
        print(f"[Skills] AI extraction failed ({e}), using local fallback...")

    # Local Keyword Fallback
    return _extract_skills_local(text)


def _extract_skills_local(text: str) -> list[str]:
    """Regex-based skill extraction from resume text. No API calls needed."""
    import re

    known_skills = [
        "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust",
        "Ruby", "PHP", "Swift", "Kotlin", "SQL", "R",
        "React", "Next.js", "Vue", "Angular", "Svelte", "Node.js", "Express",
        "Django", "Flask", "FastAPI", "Spring Boot", "Laravel",
        "TensorFlow", "PyTorch", "Scikit-learn", "Keras", "OpenCV", "Pandas", "NumPy",
        "Machine Learning", "Deep Learning", "NLP", "Computer Vision",
        "LangChain", "LangGraph", "CrewAI", "LLM", "GPT", "RAG",
        "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform",
        "PostgreSQL", "MongoDB", "Redis", "MySQL", "Firebase", "Supabase",
        "GraphQL", "REST API", "Git", "Linux",
        "Figma", "HTML", "CSS", "Tailwind",
        "Data Analysis", "Data Science", "Power BI", "Tableau",
        "Blockchain", "Solidity", "Web3",
        "Flutter", "React Native", "Selenium", "Playwright",
        "MLOps", "DevOps", "Microservices",
        "OpenAI API", "Prompt Engineering",
        "Full-Stack", "Backend", "Frontend",
    ]

    text_lower = text.lower()
    found = []
    for skill in known_skills:
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, text_lower):
            found.append(skill)

    seen = set()
    unique = []
    for s in found:
        key = s.lower()
        if key not in seen:
            seen.add(key)
            unique.append(s)

    return unique[:10] if unique else ["Software Development", "Programming", "Developer"]

