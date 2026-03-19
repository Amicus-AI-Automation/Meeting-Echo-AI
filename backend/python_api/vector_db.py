from config import CHROMA_PATH, COLLECTION_NAME
from embedding import get_embeddings

_chroma_client = None
_chroma_collection = None

def get_collection(meeting_id: str):
    global _chroma_client
    import chromadb
    if _chroma_client is None:
        _chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
    
    # Each meeting has its own collection
    collection_name = f"meeting_{meeting_id}"
    return _chroma_client.get_or_create_collection(name=collection_name)

def embed_and_store(chunks: list, meeting_id: str):
    collection = get_collection(meeting_id)

    # Remove existing chunks for this meeting (re-index)
    if meeting_id:
        try:
            # When using separate collections, we can just delete/reset the collection
            # but for safety let's just delete by ID if needed, or if we use get_or_create
            # the easiest is to just clear the collection
            existing = collection.get()
            if existing["ids"]:
                collection.delete(ids=existing["ids"])
                print(f"🗑️  Cleared old chunks for collection meeting_{meeting_id}")
        except Exception:
            pass

    if not chunks:
        return

    ids = [c["id"] for c in chunks]
    documents = [c["text"] for c in chunks]
    metadatas = []
    for c in chunks:
        meta = c["metadata"].copy()
        meta["start"] = float(c["start"])
        meta["end"] = float(c["end"])
        metadatas.append(meta)

    embeddings = get_embeddings(documents)

    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=documents,
        metadatas=metadatas
    )
    print(f"✅ Stored {len(chunks)} chunks in ChromaDB")

def query_collection(query_embedding: list, meeting_id: str, n_results: int = 15):
    collection = get_collection(meeting_id)
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results
    )
    return results
