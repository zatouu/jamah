from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="SEARCH_", env_file=".env", extra="ignore")

    es_url: str = "http://localhost:9200"
    index_prefix: str = "jamah"
    index_token: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()
