"""Recherche hybride : mot à mot (BM25, tolérant aux fautes) + sémantique (kNN), fusionnées par RRF."""

import asyncio
from dataclasses import dataclass
from typing import Any

from elasticsearch import AsyncElasticsearch

from .embeddings import Embedder
from .fusion import reciprocal_rank_fusion
from .index_schema import INDEX_SETTINGS, index_mappings
from .models import Hit, IndexDocument, IndexReport, SearchResponse

MARK_START = "\ue000"
MARK_END = "\ue001"
SNIPPET_LENGTH = 220
_TEXT_FIELDS = ["title^3", "title.ar^3", "title.fr^3", "text", "text.ar", "text.fr"]
_PHRASE_FIELDS = ["title^3", "text"]

HIGHLIGHT: dict[str, Any] = {
    "pre_tags": [MARK_START],
    "post_tags": [MARK_END],
    "require_field_match": False,
    "fields": {
        "text": {"fragment_size": 180, "number_of_fragments": 2},
        "text.ar": {"fragment_size": 180, "number_of_fragments": 2},
        "text.fr": {"fragment_size": 180, "number_of_fragments": 2},
    },
}


@dataclass(frozen=True)
class SearchFilters:
    kind: str | None = None
    lang: str | None = None
    section: str | None = None

    def clauses(self) -> list[dict[str, Any]]:
        # Seuls les contenus publiés sont cherchables, même si un autre statut a été indexé par erreur.
        clauses: list[dict[str, Any]] = [{"term": {"status": "published"}}]
        for field in ("kind", "lang", "section"):
            value = getattr(self, field)
            if value:
                clauses.append({"term": {field: value}})
        return clauses


def is_exact_phrase(query: str) -> bool:
    return len(query) > 2 and query.startswith('"') and query.endswith('"')


def lexical_query(query: str, filters: SearchFilters) -> dict[str, Any]:
    text = query.strip().strip('"').strip()
    if is_exact_phrase(query.strip()):
        return {"bool": {"must": [{"multi_match": {"query": text, "type": "phrase", "fields": _PHRASE_FIELDS}}], "filter": filters.clauses()}}
    return {
        "bool": {
            "must": [
                {
                    "multi_match": {
                        "query": text,
                        "type": "best_fields",
                        "fields": _TEXT_FIELDS,
                        "fuzziness": "AUTO",
                        "prefix_length": 1,
                        "minimum_should_match": "2<75%",
                    }
                }
            ],
            "should": [{"multi_match": {"query": text, "type": "phrase", "fields": _PHRASE_FIELDS, "boost": 3}}],
            "filter": filters.clauses(),
        }
    }


def knn_query(vector: list[float], filters: SearchFilters, k: int, min_similarity: float) -> dict[str, Any]:
    return {
        "field": "embedding",
        "query_vector": vector,
        "k": k,
        "num_candidates": max(50, k * 5),
        "similarity": min_similarity,
        "filter": {"bool": {"filter": filters.clauses()}},
    }


def build_snippet(hit: dict[str, Any]) -> str:
    for field in ("text", "text.ar", "text.fr"):
        fragments = hit.get("highlight", {}).get(field)
        if fragments:
            return " … ".join(fragments)
    text: str = hit["_source"].get("text", "")
    return text[:SNIPPET_LENGTH] + ("…" if len(text) > SNIPPET_LENGTH else "")


def to_hit(hit: dict[str, Any], score: float, match: str) -> Hit:
    source = hit["_source"]
    return Hit(
        id=hit["_id"],
        kind=source["kind"],
        title=source["title"],
        snippet=build_snippet(hit),
        lang=source["lang"],
        url=source.get("url"),
        anchor=source.get("anchor"),
        section=source.get("section"),
        author=source.get("author"),
        work=source.get("work"),
        source_nature=source.get("source_nature"),
        refs=source.get("refs", []),
        score=round(score, 6),
        match=match,  # type: ignore[arg-type]
    )


def document_body(doc: IndexDocument, vector: list[float] | None) -> dict[str, Any]:
    body = doc.model_dump(exclude={"id"}, exclude_none=True, mode="json")
    if vector is not None:
        body["embedding"] = vector
    return body


class SearchEngine:
    def __init__(self, es: AsyncElasticsearch, index: str, embedder: Embedder | None, min_similarity: float) -> None:
        self.es = es
        self.index = index
        self.embedder = embedder
        self.min_similarity = min_similarity

    async def ensure_index(self) -> bool:
        if await self.es.indices.exists(index=self.index):
            return False
        dims = self.embedder.dims if self.embedder else None
        await self.es.indices.create(index=self.index, settings=INDEX_SETTINGS, mappings=index_mappings(dims))
        return True

    async def search(self, query: str, filters: SearchFilters, limit: int) -> SearchResponse:
        size = limit * 2
        lexical = await self.es.search(
            index=self.index, query=lexical_query(query, filters), highlight=HIGHLIGHT, size=size, source_excludes=["embedding"]
        )
        lexical_hits: list[dict[str, Any]] = lexical["hits"]["hits"]

        semantic_hits: list[dict[str, Any]] = []
        hybrid = self.embedder is not None and not is_exact_phrase(query.strip())
        if hybrid and self.embedder is not None:
            vector = (await asyncio.to_thread(self.embedder.embed, [query]))[0]
            semantic = await self.es.search(
                index=self.index, knn=knn_query(vector, filters, size, self.min_similarity), size=size, source_excludes=["embedding"]
            )
            semantic_hits = semantic["hits"]["hits"]

        lexical_ids = [h["_id"] for h in lexical_hits]
        semantic_ids = [h["_id"] for h in semantic_hits]
        # Les résultats lexicaux priment : ils portent le surlignage des mots trouvés.
        by_id = {h["_id"]: h for h in semantic_hits} | {h["_id"]: h for h in lexical_hits}
        fused = reciprocal_rank_fusion([lexical_ids, semantic_ids])

        def match_of(doc_id: str) -> str:
            in_lexical, in_semantic = doc_id in lexical_ids, doc_id in semantic_ids
            return "both" if in_lexical and in_semantic else "lexical" if in_lexical else "semantic"

        hits = [to_hit(by_id[doc_id], score, match_of(doc_id)) for doc_id, score in fused[:limit]]
        return SearchResponse(query=query, mode="hybrid" if hybrid else "lexical", total=len(fused), hits=hits)

    async def suggest(self, prefix: str, limit: int) -> list[str]:
        result = await self.es.search(
            index=self.index,
            query={
                "bool": {
                    "must": [
                        {
                            "multi_match": {
                                "query": prefix,
                                "type": "bool_prefix",
                                "fields": ["title.suggest", "title.suggest._2gram", "title.suggest._3gram"],
                            }
                        }
                    ],
                    "filter": SearchFilters().clauses(),
                }
            },
            source_includes=["title"],
            size=limit * 2,
        )
        titles = dict.fromkeys(h["_source"]["title"] for h in result["hits"]["hits"])
        return list(titles)[:limit]

    async def upsert(self, docs: list[IndexDocument]) -> IndexReport:
        published = [d for d in docs if d.status == "published"]
        withdrawn = [d for d in docs if d.status != "published"]
        vectors: list[list[float] | None] = [None] * len(published)
        if self.embedder and published:
            texts = [f"{d.title}\n{d.text[:2000]}" for d in published]
            vectors = list(await asyncio.to_thread(self.embedder.embed, texts))

        operations: list[dict[str, Any]] = []
        for doc, vector in zip(published, vectors, strict=True):
            operations += [{"index": {"_index": self.index, "_id": doc.id}}, document_body(doc, vector)]
        for doc in withdrawn:
            operations.append({"delete": {"_index": self.index, "_id": doc.id}})
        if not operations:
            return IndexReport(indexed=0, deleted=0, errors=0)

        result = await self.es.bulk(operations=operations, refresh="wait_for")
        errors = sum(
            1
            for item in result["items"]
            for action, outcome in item.items()
            if outcome.get("error") and not (action == "delete" and outcome.get("status") == 404)
        )
        return IndexReport(indexed=len(published), deleted=len(withdrawn), errors=errors)

    async def delete(self, doc_id: str) -> None:
        await self.es.options(ignore_status=404).delete(index=self.index, id=doc_id, refresh="wait_for")
