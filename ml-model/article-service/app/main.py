from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.recommender import (
    get_similar_articles_by_slug,
    get_similar_articles_by_text,
    load_recommender,
)
from app.schemas import (
    HealthResponse,
    SimilarArticlesBySlugRequest,
    SimilarArticlesByTextRequest,
    SimilarArticlesResponse,
)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.recommender_ready = load_recommender()
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    lifespan=lifespan,
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


@app.post(
    "/similar-articles/by-slug",
    response_model=SimilarArticlesResponse,
)
def similar_articles_by_slug(
    payload: SimilarArticlesBySlugRequest,
) -> SimilarArticlesResponse:
    try:
        return get_similar_articles_by_slug(payload.slug, payload.limit)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to generate similar articles by slug: {exc}",
        ) from exc


@app.post(
    "/similar-articles/by-text",
    response_model=SimilarArticlesResponse,
)
def similar_articles_by_text(
    payload: SimilarArticlesByTextRequest,
) -> SimilarArticlesResponse:
    try:
        return get_similar_articles_by_text(payload.text, payload.limit)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to generate similar articles by text: {exc}",
        ) from exc
