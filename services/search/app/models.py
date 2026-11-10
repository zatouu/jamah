from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

ContentKind = Literal["page", "document", "passage", "poem", "video", "quran", "hadith"]
Lang = Literal["ar", "fr", "wo", "en", "mixed"]
Status = Literal["draft", "in_review", "validated", "published", "archived"]
SourceNature = Literal["documented", "testimony", "community", "interpretation", "jamah"]


class IndexDocument(BaseModel):
    id: str = Field(pattern=r"^[A-Za-z0-9:_.\-]{1,200}$")
    kind: ContentKind
    status: Status
    title: str = Field(max_length=500)
    text: str = Field(default="", max_length=200_000)
    lang: Lang
    section: str | None = None
    author: str | None = None
    work: str | None = None
    source_nature: SourceNature | None = None
    refs: list[str] = Field(default_factory=list, max_length=200)
    url: str | None = Field(default=None, max_length=1000)
    anchor: str | None = Field(default=None, max_length=200)
    published_at: datetime | None = None


class Hit(BaseModel):
    id: str
    kind: str
    title: str
    # Passages trouvés délimités par MARK_START / MARK_END (jamais de HTML)
    snippet: str
    lang: str
    url: str | None = None
    anchor: str | None = None
    section: str | None = None
    author: str | None = None
    work: str | None = None
    source_nature: str | None = None
    refs: list[str] = Field(default_factory=list)
    score: float
    match: Literal["lexical", "semantic", "both"]


class SearchResponse(BaseModel):
    query: str
    mode: Literal["hybrid", "lexical"]
    total: int
    hits: list[Hit]


class IndexReport(BaseModel):
    indexed: int
    deleted: int
    errors: int
