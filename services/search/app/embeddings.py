"""Vecteurs sémantiques multilingues (arabe, français), calculés localement : aucune API externe."""

from typing import Protocol


class Embedder(Protocol):
    dims: int

    def embed(self, texts: list[str]) -> list[list[float]]: ...


class FastEmbedder:
    """Modèle ONNX via fastembed (CPU). Exemple : sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2."""

    def __init__(self, model_name: str, cache_dir: str | None = None) -> None:
        from fastembed import TextEmbedding  # dépendance optionnelle (requirements-semantic.txt)

        self._model = TextEmbedding(model_name=model_name, cache_dir=cache_dir)
        self.dims = len(self.embed(["dimension"])[0])

    def embed(self, texts: list[str]) -> list[list[float]]:
        return [vector.tolist() for vector in self._model.embed(texts)]


def load_embedder(model_name: str, cache_dir: str | None = None) -> Embedder | None:
    return FastEmbedder(model_name, cache_dir) if model_name else None
