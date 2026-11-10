"""Schéma de l'index : analyseurs arabe / français (plugin ICU) et vecteur sémantique optionnel."""

from typing import Any

INDEX_SETTINGS: dict[str, Any] = {
    "analysis": {
        "filter": {
            "fr_elision": {
                "type": "elision",
                "articles_case": True,
                "articles": ["l", "m", "t", "qu", "n", "s", "j", "d", "c", "jusqu", "quoiqu", "lorsqu", "puisqu"],
            },
            "fr_stem": {"type": "stemmer", "language": "light_french"},
            "ar_stem": {"type": "stemmer", "language": "arabic"},
        },
        "analyzer": {
            # Mot à mot : formes exactes, sans diacritiques ni variantes d'alif
            "jamah_exact": {"tokenizer": "icu_tokenizer", "filter": ["icu_folding", "arabic_normalization"]},
            "jamah_ar": {"tokenizer": "icu_tokenizer", "filter": ["lowercase", "decimal_digit", "arabic_normalization", "ar_stem"]},
            "jamah_fr": {"tokenizer": "icu_tokenizer", "filter": ["fr_elision", "icu_folding", "fr_stem"]},
        },
    }
}

_KEYWORD = {"type": "keyword"}
_STORED_ONLY = {"type": "keyword", "index": False}


def _multilingual_text(with_suggest: bool = False) -> dict[str, Any]:
    fields: dict[str, Any] = {
        "ar": {"type": "text", "analyzer": "jamah_ar"},
        "fr": {"type": "text", "analyzer": "jamah_fr"},
    }
    if with_suggest:
        fields["suggest"] = {"type": "search_as_you_type", "analyzer": "jamah_exact"}
    return {"type": "text", "analyzer": "jamah_exact", "fields": fields}


def index_mappings(embedding_dims: int | None) -> dict[str, Any]:
    properties: dict[str, Any] = {
        "kind": _KEYWORD,
        "lang": _KEYWORD,
        "status": _KEYWORD,
        "section": _KEYWORD,
        "author": _KEYWORD,
        "work": _KEYWORD,
        "source_nature": _KEYWORD,
        "refs": _KEYWORD,
        "url": _STORED_ONLY,
        "anchor": _STORED_ONLY,
        "published_at": {"type": "date"},
        "title": _multilingual_text(with_suggest=True),
        "text": _multilingual_text(),
    }
    if embedding_dims:
        properties["embedding"] = {"type": "dense_vector", "dims": embedding_dims, "index": True, "similarity": "cosine"}
    return {"dynamic": "strict", "properties": properties}
