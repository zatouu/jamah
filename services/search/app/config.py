from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="SEARCH_", env_file=".env", extra="ignore")

    es_url: str = "http://localhost:9200"
    index_prefix: str = "jamah"
    index_token: str = ""
    # Vide = recherche mot à mot seule. Ex. : sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
    embedding_model: str = ""
    embedding_cache_dir: str | None = None
    semantic_min_similarity: float = 0.55

    @property
    def content_index(self) -> str:
        return f"{self.index_prefix}-content"


@lru_cache
def get_settings() -> Settings:
    return Settings()
