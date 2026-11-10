"""Fusion des classements lexical et sémantique (Reciprocal Rank Fusion).

Calculée ici plutôt que par le `retriever: rrf` d'Elasticsearch, soumis à licence selon les versions.
"""

from collections.abc import Sequence


def reciprocal_rank_fusion(rankings: Sequence[Sequence[str]], k: int = 60) -> list[tuple[str, float]]:
    scores: dict[str, float] = {}
    for ranking in rankings:
        for rank, doc_id in enumerate(ranking, start=1):
            scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
    return sorted(scores.items(), key=lambda item: item[1], reverse=True)
