"""
Soloist Agent — ChromaDB Vector Store Interface
Wraps ChromaDB for resume chunk storage and similarity search.
"""

import chromadb
from chromadb.config import Settings

from app.config import CHROMA_DIR

# Persistent ChromaDB client
_client = chromadb.PersistentClient(
    path=CHROMA_DIR,
    settings=Settings(anonymized_telemetry=False),
)

COLLECTION_NAME = "resume_chunks"


def get_collection():
    """Get or create the resume chunks collection."""
    return _client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )


def add_documents(chunks: list[str], embeddings: list[list[float]], ids: list[str]):
    """
    Add document chunks with their embeddings to ChromaDB.

    Args:
        chunks: List of text chunks
        embeddings: Corresponding embedding vectors
        ids: Unique IDs for each chunk
    """
    collection = get_collection()
    collection.add(
        documents=chunks,
        embeddings=embeddings,
        ids=ids,
    )


def query(query_embedding: list[float], n_results: int = 5) -> dict:
    """
    Query ChromaDB with an embedding vector for similar resume chunks.

    Args:
        query_embedding: The embedding vector to search with
        n_results: Number of results to return

    Returns:
        ChromaDB query results dict with documents, distances, etc.
    """
    collection = get_collection()
    return collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
    )


def query_text(text: str, n_results: int = 5) -> dict:
    """
    Query ChromaDB with raw text (uses ChromaDB's built-in embedding).

    Args:
        text: The search query text
        n_results: Number of results to return

    Returns:
        ChromaDB query results dict
    """
    collection = get_collection()
    return collection.query(
        query_texts=[text],
        n_results=n_results,
    )


def clear_collection():
    """Delete and recreate the collection (for fresh uploads)."""
    _client.delete_collection(COLLECTION_NAME)
    return get_collection()


def get_chunk_count() -> int:
    """Return the number of chunks currently stored."""
    collection = get_collection()
    return collection.count()
