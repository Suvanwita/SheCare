from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.recommender import get_similar_articles
from app.schemas import (
    HealthResponse,
    SimilarArticlesRequest,
    SimilarArticlesResponse,
)

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service=settings.app_name,
        version=settings.app_version,
        environment=settings.environment,
    )


@app.post("/similar-articles", response_model=SimilarArticlesResponse)
def similar_articles(
    payload: SimilarArticlesRequest,
) -> SimilarArticlesResponse:
    return get_similar_articles(payload)
