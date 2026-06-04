import json
from pathlib import Path
from typing import Any, Dict, List, Optional

import joblib
from app.schemas import SimilarArticlesRequest, SimilarArticlesResponse
from app.utils.text_cleaning import combine_text_fields
from sklearn.metrics.pairwise import cosine_similarity


VECTORIZER_PATH = Path("model/tfidf_vectorizer.pkl")
ARTICLE_VECTORS_PATH = Path("model/article_vectors.pkl")
METADATA_PATH = Path("model/articles_metadata.json")

_vectorizer = None
_article_vectors = None
_articles_metadata: List[Dict[str, Any]] = []
_load_error: Optional[str] = None
_is_loaded = False


def _empty_response(message: str) -> SimilarArticlesResponse:
    return SimilarArticlesResponse(recommendations=[], message=message)


def _missing_artifact_message() -> str:
    return (
        "Article recommender model files are missing. "
        "Run python train_recommender.py to generate TF-IDF artifacts."
    )


def load_recommender() -> bool:
    global _article_vectors
    global _articles_metadata
    global _is_loaded
    global _load_error
    global _vectorizer

    if _is_loaded:
        return True

    missing_files = [
        str(path)
        for path in [VECTORIZER_PATH, ARTICLE_VECTORS_PATH, METADATA_PATH]
        if not path.exists()
    ]

    if missing_files:
        _load_error = f"{_missing_artifact_message()} Missing: {', '.join(missing_files)}"
        return False

    try:
        _vectorizer = joblib.load(VECTORIZER_PATH)
        vectors_artifact = joblib.load(ARTICLE_VECTORS_PATH)

        if isinstance(vectors_artifact, dict):
            _article_vectors = vectors_artifact.get("article_vectors")
        else:
            _article_vectors = vectors_artifact

        with METADATA_PATH.open("r", encoding="utf-8") as metadata_file:
            _articles_metadata = json.load(metadata_file)

        if _article_vectors is None:
            raise ValueError("article_vectors.pkl does not contain article vectors")

        if len(_articles_metadata) != _article_vectors.shape[0]:
            raise ValueError(
                "Article metadata count does not match TF-IDF vector count"
            )

        _load_error = None
        _is_loaded = True
        return True
    except Exception as exc:
        _load_error = f"Unable to load article recommender artifacts: {exc}"
        _is_loaded = False
        return False


def _format_article(metadata: Dict[str, Any], similarity_score: float) -> Dict[str, Any]:
    return {
        "slug": metadata.get("slug", ""),
        "title": metadata.get("title", ""),
        "category": metadata.get("category", ""),
        "summary": metadata.get("summary", ""),
        "reading_time": metadata.get("reading_time"),
        "cover_image": metadata.get("cover_image"),
        "similarity_score": round(float(similarity_score), 4),
    }


def _top_matches(
    similarities,
    limit: int,
    exclude_index: Optional[int] = None,
) -> List[Dict[str, Any]]:
    ranked_indices = similarities.argsort()[::-1]
    recommendations = []

    for index in ranked_indices:
        if exclude_index is not None and index == exclude_index:
            continue

        recommendations.append(
            _format_article(_articles_metadata[index], similarities[index])
        )

        if len(recommendations) >= limit:
            break

    return recommendations


def get_similar_articles_by_slug(
    slug: str,
    limit: int = 4,
) -> SimilarArticlesResponse:
    if not load_recommender():
        return _empty_response(_load_error or _missing_artifact_message())

    article_index = next(
        (
            index
            for index, article in enumerate(_articles_metadata)
            if article.get("slug") == slug
        ),
        None,
    )

    if article_index is None:
        return _empty_response(f"No article found for slug: {slug}")

    # TF-IDF turns each article into weighted terms. Cosine similarity compares
    # vector direction, so articles with similar language rank closer together.
    selected_vector = _article_vectors[article_index]
    similarities = cosine_similarity(selected_vector, _article_vectors).flatten()
    recommendations = _top_matches(
        similarities,
        limit=limit,
        exclude_index=article_index,
    )

    return SimilarArticlesResponse(
        recommendations=recommendations,
        message="Similar articles generated from article slug.",
    )


def get_similar_articles_by_text(
    text: str,
    limit: int = 4,
) -> SimilarArticlesResponse:
    if not load_recommender():
        return _empty_response(_load_error or _missing_artifact_message())

    cleaned_text = combine_text_fields(text)

    if not cleaned_text:
        return _empty_response("Text is required to generate similar articles.")

    # The saved TF-IDF vectorizer applies the same learned vocabulary to new
    # text, then cosine similarity ranks existing articles by content overlap.
    text_vector = _vectorizer.transform([cleaned_text])
    similarities = cosine_similarity(text_vector, _article_vectors).flatten()
    recommendations = _top_matches(similarities, limit=limit)

    return SimilarArticlesResponse(
        recommendations=recommendations,
        message="Similar articles generated from input text.",
    )


def get_similar_articles(
    payload: SimilarArticlesRequest,
) -> SimilarArticlesResponse:
    if payload.slug:
        return get_similar_articles_by_slug(payload.slug, payload.limit)

    text = combine_text_fields(
        payload.title,
        payload.content,
        payload.tags,
        payload.keywords,
    )

    return get_similar_articles_by_text(text, payload.limit)
