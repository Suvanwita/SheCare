import json
from pathlib import Path

import joblib
import pandas as pd
from app.utils.text_cleaning import combine_text_fields
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data/articles.csv"
MODEL_DIR = BASE_DIR / "model"
VECTORIZER_PATH = MODEL_DIR / "tfidf_vectorizer.pkl"
ARTICLE_VECTORS_PATH = MODEL_DIR / "article_vectors.pkl"
METADATA_PATH = MODEL_DIR / "articles_metadata.json"

REQUIRED_COLUMNS = [
    "article_id",
    "slug",
    "title",
    "category",
    "summary",
    "content",
    "tags",
    "keywords",
    "reading_time",
    "cover_image",
]

TEXT_COLUMNS = [
    "title",
    "category",
    "summary",
    "content",
    "tags",
    "keywords",
]

METADATA_COLUMNS = [
    "article_id",
    "slug",
    "title",
    "category",
    "summary",
    "reading_time",
    "cover_image",
]


def log(message: str) -> None:
    print(f"[article-recommender] {message}")


def validate_columns(dataframe: pd.DataFrame) -> None:
    missing_columns = [
        column for column in REQUIRED_COLUMNS if column not in dataframe.columns
    ]

    if missing_columns:
        raise ValueError(
            "articles.csv is missing required columns: "
            f"{', '.join(missing_columns)}"
        )


def load_articles() -> pd.DataFrame:
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            "Missing dataset: data/articles.csv. "
            "Create it with the expected Knowledge Hub article columns."
        )

    log(f"Loading dataset from {DATA_PATH}")
    articles = pd.read_csv(DATA_PATH)
    validate_columns(articles)
    log(f"Loaded {len(articles)} article rows")

    return articles


def prepare_articles(articles: pd.DataFrame) -> pd.DataFrame:
    log("Cleaning missing values")
    prepared_articles = articles.copy()
    prepared_articles[REQUIRED_COLUMNS] = prepared_articles[REQUIRED_COLUMNS].fillna("")

    log("Creating explainable combined_text from article fields")
    prepared_articles["combined_text"] = prepared_articles.apply(
        lambda row: combine_text_fields(
            *[row[column] for column in TEXT_COLUMNS]
        ),
        axis=1,
    )

    prepared_articles = prepared_articles[
        prepared_articles["combined_text"].str.len() > 0
    ].reset_index(drop=True)

    if prepared_articles.empty:
        raise ValueError("No articles contain text after cleaning.")

    log(f"Prepared {len(prepared_articles)} articles for TF-IDF training")
    return prepared_articles


def train_tfidf(articles: pd.DataFrame):
    log("Training TF-IDF vectorizer")
    vectorizer = TfidfVectorizer(
        stop_words="english",
        max_features=5000,
        ngram_range=(1, 2),
    )
    article_vectors = vectorizer.fit_transform(articles["combined_text"])

    log(
        "TF-IDF training complete: "
        f"{article_vectors.shape[0]} articles x {article_vectors.shape[1]} features"
    )

    return vectorizer, article_vectors


def save_artifacts(
    articles: pd.DataFrame,
    vectorizer: TfidfVectorizer,
    article_vectors,
) -> None:
    MODEL_DIR.mkdir(exist_ok=True)

    log("Computing cosine similarity matrix")
    similarity_matrix = cosine_similarity(article_vectors)

    metadata = articles[METADATA_COLUMNS].to_dict(orient="records")

    log(f"Saving vectorizer to {VECTORIZER_PATH}")
    joblib.dump(vectorizer, VECTORIZER_PATH)

    log(f"Saving article vectors and similarity matrix to {ARTICLE_VECTORS_PATH}")
    joblib.dump(
        {
            "article_vectors": article_vectors,
            "cosine_similarity": similarity_matrix,
        },
        ARTICLE_VECTORS_PATH,
    )

    log(f"Saving article metadata to {METADATA_PATH}")
    with METADATA_PATH.open("w", encoding="utf-8") as metadata_file:
        json.dump(metadata, metadata_file, indent=2, ensure_ascii=False)


def main() -> dict:
    log("Starting content-based article recommendation training")
    articles = load_articles()
    prepared_articles = prepare_articles(articles)
    vectorizer, article_vectors = train_tfidf(prepared_articles)
    save_artifacts(prepared_articles, vectorizer, article_vectors)
    log("Training pipeline finished successfully")

    return {
        "article_count": len(prepared_articles),
        "feature_count": int(article_vectors.shape[1]),
        "vectorizer_path": str(VECTORIZER_PATH),
        "article_vectors_path": str(ARTICLE_VECTORS_PATH),
        "metadata_path": str(METADATA_PATH),
    }


if __name__ == "__main__":
    main()
