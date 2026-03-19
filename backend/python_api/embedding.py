from config import EMBED_MODEL_NAME

_embed_model = None

def get_embed_model():
    global _embed_model
    if _embed_model is None:
        from sentence_transformers import SentenceTransformer
        print("⏳ Loading embedding model …")
        _embed_model = SentenceTransformer(EMBED_MODEL_NAME)
        print("✅ Embedding model loaded")
    return _embed_model

def get_embeddings(texts: list) -> list:
    model = get_embed_model()
    return model.encode(texts, show_progress_bar=True).tolist()
