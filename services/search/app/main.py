"""Search Service — API de recherche documentaire de la Jamah.

Recherche hybride : mot à mot (Elasticsearch, analyseurs arabe/français) + sémantique (vecteurs locaux).
Le site public ne parle qu'à cette API (jamais directement à Elasticsearch).
"""

import secrets
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Annotated, Literal

from elasticsearch import ApiError, AsyncElasticsearch, TransportError
from fastapi import Body, Depends, FastAPI, Header, HTTPException, Path, Query, Request, Response, status
from pydantic import BaseModel

from .config import Settings, get_settings
from .embeddings import load_embedder
from .engine import SearchEngine, SearchFilters
from .models import ContentKind, IndexDocument, IndexReport, Lang, SearchResponse

API_VERSION = "v1"


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    es = AsyncElasticsearch(settings.es_url, request_timeout=10)
    embedder = load_embedder(settings.embedding_model, settings.embedding_cache_dir)
    app.state.engine = SearchEngine(es, settings.content_index, embedder, settings.semantic_min_similarity)
    try:
        yield
    finally:
        await es.close()


app = FastAPI(title="Jamah Search Service", version="0.2.0", docs_url="/docs", redoc_url=None, lifespan=lifespan)


class Health(BaseModel):
    status: Literal["ok", "degraded"]
    api_version: str
    elasticsearch: Literal["up", "down"]


async def ping_elasticsearch(settings: Annotated[Settings, Depends(get_settings)]) -> bool:
    client = AsyncElasticsearch(settings.es_url, request_timeout=2)
    try:
        return bool(await client.ping())
    except Exception:
        return False
    finally:
        await client.close()


def get_engine(request: Request) -> SearchEngine:
    return request.app.state.engine


def require_index_token(
    settings: Annotated[Settings, Depends(get_settings)],
    authorization: Annotated[str | None, Header()] = None,
) -> None:
    if not settings.index_token:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Indexation désactivée (SEARCH_INDEX_TOKEN absent)")
    expected = f"Bearer {settings.index_token}"
    if not authorization or not secrets.compare_digest(authorization.encode(), expected.encode()):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Jeton d'indexation invalide")


Engine = Annotated[SearchEngine, Depends(get_engine)]
IndexAuth = Depends(require_index_token)


@app.get("/health", response_model=Health)
async def health(response: Response, es_up: Annotated[bool, Depends(ping_elasticsearch)]) -> Health:
    if not es_up:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return Health(
        status="ok" if es_up else "degraded",
        api_version=API_VERSION,
        elasticsearch="up" if es_up else "down",
    )


@app.get("/v1/search", response_model=SearchResponse)
async def search(
    engine: Engine,
    q: Annotated[str, Query(min_length=1, max_length=200)],
    kind: ContentKind | None = None,
    lang: Lang | None = None,
    section: Annotated[str | None, Query(max_length=100)] = None,
    limit: Annotated[int, Query(ge=1, le=50)] = 20,
) -> SearchResponse:
    try:
        return await engine.search(q, SearchFilters(kind=kind, lang=lang, section=section), limit)
    except (ApiError, TransportError) as exc:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Moteur de recherche indisponible") from exc


@app.get("/v1/suggest", response_model=list[str])
async def suggest(
    engine: Engine,
    q: Annotated[str, Query(min_length=1, max_length=100)],
    limit: Annotated[int, Query(ge=1, le=10)] = 6,
) -> list[str]:
    try:
        return await engine.suggest(q, limit)
    except (ApiError, TransportError) as exc:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Moteur de recherche indisponible") from exc


@app.post("/v1/admin/setup", dependencies=[IndexAuth])
async def setup(engine: Engine) -> dict[str, bool]:
    return {"created": await engine.ensure_index()}


@app.post("/v1/documents", response_model=IndexReport, dependencies=[IndexAuth])
async def upsert_documents(engine: Engine, docs: Annotated[list[IndexDocument], Body(max_length=500)]) -> IndexReport:
    return await engine.upsert(docs)


@app.delete("/v1/documents/{doc_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[IndexAuth])
async def delete_document(engine: Engine, doc_id: Annotated[str, Path(pattern=r"^[A-Za-z0-9:_.\-]{1,200}$")]) -> None:
    await engine.delete(doc_id)
