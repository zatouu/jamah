from typing import Any

from fastapi.testclient import TestClient

from app.config import Settings, get_settings
from app.engine import MARK_END, MARK_START, SearchEngine, SearchFilters, lexical_query
from app.main import app, get_engine
from app.models import IndexDocument


class FakeIndices:
    async def exists(self, index: str) -> bool:
        return True


class FakeES:
    """Imite les réponses d'Elasticsearch utiles aux tests."""

    def __init__(self, lexical: list[dict[str, Any]], semantic: list[dict[str, Any]] | None = None) -> None:
        self.lexical = lexical
        self.semantic = semantic or []
        self.indices = FakeIndices()
        self.bulk_operations: list[dict[str, Any]] = []

    async def search(self, **kwargs: Any) -> dict[str, Any]:
        hits = self.semantic if "knn" in kwargs else self.lexical
        return {"hits": {"hits": hits}}

    async def bulk(self, operations: list[dict[str, Any]], refresh: str) -> dict[str, Any]:
        self.bulk_operations = operations
        return {"items": [{next(iter(op)): {"status": 200}} for op in operations if "index" in op or "delete" in op]}


class FakeEmbedder:
    dims = 3

    def embed(self, texts: list[str]) -> list[list[float]]:
        return [[0.1, 0.2, 0.3] for _ in texts]


def es_hit(doc_id: str, text: str, highlight: list[str] | None = None) -> dict[str, Any]:
    hit: dict[str, Any] = {"_id": doc_id, "_source": {"kind": "passage", "title": f"Titre {doc_id}", "text": text, "lang": "fr"}}
    if highlight:
        hit["highlight"] = {"text": highlight}
    return hit


client = TestClient(app)


def run_search(engine: SearchEngine, params: dict[str, str]) -> dict[str, Any]:
    app.dependency_overrides[get_engine] = lambda: engine
    try:
        res = client.get("/v1/search", params=params)
    finally:
        app.dependency_overrides.clear()
    assert res.status_code == 200, res.text
    return res.json()


def test_lexical_only_without_embedder():
    es = FakeES([es_hit("p1", "Le dhikr du vendredi", [f"Le {MARK_START}dhikr{MARK_END} du vendredi"])])
    body = run_search(SearchEngine(es, "jamah-content", None, 0.5), {"q": "dhikr"})  # type: ignore[arg-type]
    assert body["mode"] == "lexical"
    assert body["hits"][0]["snippet"] == f"Le {MARK_START}dhikr{MARK_END} du vendredi"
    assert body["hits"][0]["match"] == "lexical"


def test_hybrid_merges_lexical_and_semantic():
    es = FakeES([es_hit("p1", "dhikr"), es_hit("p2", "wird")], [es_hit("p2", "wird"), es_hit("p3", "souvenir de Dieu")])
    body = run_search(SearchEngine(es, "jamah-content", FakeEmbedder(), 0.5), {"q": "dhikr"})  # type: ignore[arg-type]
    assert body["mode"] == "hybrid"
    assert body["hits"][0]["id"] == "p2"
    assert body["hits"][0]["match"] == "both"
    assert {h["id"] for h in body["hits"]} == {"p1", "p2", "p3"}


def test_quoted_query_is_exact_phrase_without_fuzziness():
    query = lexical_query('"ḥaḍrat al-jumuʿa"', SearchFilters())
    clause = query["bool"]["must"][0]["multi_match"]
    assert clause["type"] == "phrase"
    assert "fuzziness" not in clause


def test_only_published_content_is_searchable():
    clauses = SearchFilters(lang="ar").clauses()
    assert {"term": {"status": "published"}} in clauses
    assert {"term": {"lang": "ar"}} in clauses


def test_unpublished_documents_are_removed_from_index():
    es = FakeES([])
    engine = SearchEngine(es, "jamah-content", None, 0.5)  # type: ignore[arg-type]
    docs = [
        IndexDocument(id="a", kind="passage", status="published", title="A", lang="fr"),
        IndexDocument(id="b", kind="passage", status="draft", title="B", lang="fr"),
    ]
    app.dependency_overrides[get_engine] = lambda: engine
    app.dependency_overrides[get_settings] = lambda: Settings(index_token="secret")
    try:
        denied = client.post("/v1/documents", json=[d.model_dump(mode="json") for d in docs])
        res = client.post("/v1/documents", json=[d.model_dump(mode="json") for d in docs], headers={"Authorization": "Bearer secret"})
    finally:
        app.dependency_overrides.clear()
    assert denied.status_code == 401
    assert res.json() == {"indexed": 1, "deleted": 1, "errors": 0}
    assert {"delete": {"_index": "jamah-content", "_id": "b"}} in es.bulk_operations
