"""Search Service — API de recherche documentaire de la Jamah.

Phase 1 : squelette et santé. L'indexation et `/v1/search` arrivent en phase 5.
Le site public ne parle qu'à cette API (jamais directement à Elasticsearch).
"""

from typing import Annotated, Literal

from elasticsearch import AsyncElasticsearch
from fastapi import Depends, FastAPI, Response, status
from pydantic import BaseModel

from .config import Settings, get_settings

API_VERSION = "v1"

app = FastAPI(title="Jamah Search Service", version="0.1.0", docs_url="/docs", redoc_url=None)


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


@app.get("/health", response_model=Health)
async def health(response: Response, es_up: Annotated[bool, Depends(ping_elasticsearch)]) -> Health:
    if not es_up:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return Health(
        status="ok" if es_up else "degraded",
        api_version=API_VERSION,
        elasticsearch="up" if es_up else "down",
    )
