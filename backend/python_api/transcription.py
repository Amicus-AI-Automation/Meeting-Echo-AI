import os
import numpy as np

def transcribe_audio(audio: np.ndarray, model_size: str = "base") -> list:
    from faster_whisper import WhisperModel
    device = "cuda" if os.environ.get("CUDA_VISIBLE_DEVICES") else "cpu"
    compute_type = "float16" if device == "cuda" else "int8"

    model = WhisperModel(model_size, device=device, compute_type=compute_type)
    segments, _ = model.transcribe(audio, beam_size=5)

    return [
        {"start": seg.start, "end": seg.end, "text": seg.text.strip()}
        for seg in segments
    ]

def chunk_segments(segments: list, metadata: dict, max_words: int = 120, overlap_words: int = 30) -> list:
    chunks = []
    current_chunk: list = []
    current_words = 0

    def count_words(text): return len(text.split())

    for seg in segments:
        seg_words = count_words(seg["text"])
        if current_words + seg_words > max_words and current_chunk:
            chunks.append(current_chunk)
            overlap, overlap_count = [], 0
            for s in reversed(current_chunk):
                overlap.insert(0, s)
                overlap_count += count_words(s["text"])
                if overlap_count >= overlap_words:
                    break
            current_chunk = overlap
            current_words = overlap_count
        current_chunk.append(seg)
        current_words += seg_words

    if current_chunk:
        chunks.append(current_chunk)

    processed = []
    for idx, chunk in enumerate(chunks):
        text = " ".join([s["text"] for s in chunk]).strip()
        start = chunk[0]["start"]
        end = chunk[-1]["end"]
        processed.append({
            "id": f"{metadata['meeting_id']}_chunk_{idx:04d}",
            "text": text,
            "start": start,
            "end": end,
            "metadata": {
                "meeting_id": metadata["meeting_id"],
                "source": metadata.get("source_file", ""),
                "chunk_index": idx,
                "total_chunks": len(chunks),
                "duration": end - start,
                "access_link": metadata.get("access_link", ""),
            }
        })

    return processed
