from embedding import get_embeddings
from vector_db import query_collection
from local_llm import ask_llm
import os

SIMILARITY_THRESHOLD = float(os.getenv("RAG_SIMILARITY_THRESHOLD", 1.4))
NO_INFO_MESSAGE = "there is no information about this topic discussed in the meeting"

def format_time(seconds: float) -> str:
    seconds = int(seconds)
    h, rem = divmod(seconds, 3600)
    m, s = divmod(rem, 60)
    if h:
        return f"{h:02d}:{m:02d}:{s:02d}"
    return f"{m:02d}:{s:02d}"

def generate_answer(context: str, query: str, meeting_title: str) -> str:
    if not context.strip():
        context = "[SYSTEM WARNING: No matching transcript context could be retrieved for this question!]"

    prompt = f"""You are a helpful AI assistant analyzing a meeting transcript.

Rules:
- Read the provided transcript fragments below carefully.
- Answer the user's question ONLY using the provided context.
- If the answer is not in the context, your entire response MUST be: "there is no information about this topic discussed in the meeting"
- DO NOT use outside knowledge. DO NOT guess or hallucinate.

Meeting: {meeting_title}

Context from transcript:
{context[:12000]}

Question: {query}

Answer:"""

    try:
        # Use the ask_llm bridge which now uses Groq + Fallback to phi3:mini
        return ask_llm(prompt, model="llama-3.3-70b-versatile")
    except Exception as e:
        print(f"Generate answer total failure: {e}")
        return f"[LLM Error] Both Groq and Local Ollama failed. Excerpts:\n\n{context[:1200]}"

def retrieve_and_answer(query: str, meeting_id: str, metadata: dict) -> dict:
    query_embedding = get_embeddings([query])[0]

    try:
        results = query_collection(query_embedding, meeting_id, n_results=15)
    except Exception as e:
        raise Exception(f"Retrieval error: {str(e)}")

    docs = results.get("documents", [[]])[0]
    metas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]

    meeting_title = metadata.get("meeting_info", {}).get("title", "")

    # Filter by threshold (ChromaDB L2 distance: lower is better)
    filtered_indices = [i for i, dist in enumerate(distances) if dist <= SIMILARITY_THRESHOLD]
    
    if not filtered_indices:
        return {
            "answer": NO_INFO_MESSAGE,
            "sources": [],
            "meeting_id": meeting_id,
            "meeting_title": meeting_title
        }

    context_parts = []
    sources = []
    
    for i in filtered_indices:
        doc = docs[i]
        meta = metas[i]
        dist = distances[i]
        start = meta.get("start", 0)
        end = meta.get("end", 0)
        ts = f"[{format_time(start)} – {format_time(end)}]"
        context_parts.append(f"{ts} {doc}")
        sources.append({"timestamp": ts, "start": start, "end": end, "text": doc[:200]})

    context = "\n\n".join(context_parts)
    answer = generate_answer(context, query, meeting_title)

    return {
        "answer": answer,
        "sources": sources,
        "meeting_id": meeting_id,
        "meeting_title": meeting_title
    }
