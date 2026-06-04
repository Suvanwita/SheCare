from typing import List, Optional

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    environment: str


class SimilarArticlesBySlugRequest(BaseModel):
    slug: str = Field(min_length=1)
    limit: int = Field(default=4, ge=1, le=20)


class SimilarArticlesByTextRequest(BaseModel):
    text: str = Field(min_length=2)
    limit: int = Field(default=4, ge=1, le=20)


class SimilarArticle(BaseModel):
    slug: str
    title: str
    category: str
    summary: str
    reading_time: Optional[float] = None
    cover_image: Optional[str] = None
    similarity_score: float


class SimilarArticlesResponse(BaseModel):
    success: bool
    source: str
    recommendations: List[SimilarArticle]
