from app.schemas import SimilarArticlesRequest, SimilarArticlesResponse
from app.utils.text_cleaning import combine_text_fields


def get_similar_articles(
    payload: SimilarArticlesRequest,
) -> SimilarArticlesResponse:
    combine_text_fields(
        payload.title,
        payload.content,
        payload.tags,
        payload.keywords,
    )

    return SimilarArticlesResponse(
        recommendations=[],
        message="Article recommender placeholder is ready. Train and load a model to enable recommendations.",
    )
