from app.main import health_check, similar_articles
from app.schemas import SimilarArticlesRequest


def test_health_check() -> None:
    response = health_check()

    assert response.status == "ok"
    assert response.service == "SheCare Article ML Service"


def test_similar_articles_placeholder() -> None:
    response = similar_articles(
        SimilarArticlesRequest(
            title="PCOS nutrition basics",
            tags=["pcos", "nutrition"],
            limit=5,
        )
    )

    assert response.recommendations == []
    assert "model files are missing" in response.message.lower()
