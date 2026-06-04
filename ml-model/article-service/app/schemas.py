from typing import List, Optional

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    environment: str


class SimilarArticlesRequest(BaseModel):
    article_id: Optional[str] = Field(default=None)
    slug: Optional[str] = Field(default=None)
    title: Optional[str] = Field(default=None)
    content: Optional[str] = Field(default=None)
    tags: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)
    limit: int = Field(default=5, ge=1, le=20)


class SimilarArticle(BaseModel):
    slug: str
    title: str
    category: str
    summary: str
    reading_time: Optional[float] = None
    cover_image: Optional[str] = None
    similarity_score: float


class SimilarArticlesResponse(BaseModel):
    recommendations: List[SimilarArticle]
    message: str
