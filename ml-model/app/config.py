import json
import os
from functools import lru_cache
from typing import List

from dotenv import load_dotenv
from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str
    app_version: str
    environment: str
    cors_origins: List[str]
    model_path: str


def _parse_cors_origins(value: str) -> List[str]:
    try:
        parsed = json.loads(value)
        if isinstance(parsed, list):
            return [str(origin) for origin in parsed]
    except json.JSONDecodeError:
        pass

    return [origin.strip() for origin in value.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    load_dotenv()

    return Settings(
        app_name=os.getenv("APP_NAME", "SheCare PCOS ML Service"),
        app_version=os.getenv("APP_VERSION", "0.1.0"),
        environment=os.getenv("ENVIRONMENT", "development"),
        cors_origins=_parse_cors_origins(
            os.getenv("CORS_ORIGINS", '["http://localhost:3000"]')
        ),
        model_path=os.getenv("MODEL_PATH", "model/pcos_model.joblib"),
    )
