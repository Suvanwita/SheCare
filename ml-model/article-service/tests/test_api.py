from app.main import health_check, similar_articles_by_text
from app.schemas import SimilarArticlesByTextRequest


def test_health_check() -> None:
    response = health_check()

    assert response.status == "ok"
    assert response.service == "SheCare Article ML Service"


def test_similar_articles_placeholder() -> None:
    response = similar_articles_by_text(
        SimilarArticlesByTextRequest(
            text="PCOS nutrition basics",
            limit=5,
        )
    )

    assert response.success is True
    assert response.source.startswith("tfidf-cosine-similarity")
    assert len(response.recommendations) <= 5

    if response.recommendations:
        assert response.recommendations[0].slug
        assert response.recommendations[0].similarity_score >= 0
    else:
        assert "model files are missing" in response.source.lower()
