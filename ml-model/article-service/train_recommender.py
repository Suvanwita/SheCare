from pathlib import Path


def main() -> None:
    model_dir = Path("model")
    data_dir = Path("data")
    model_dir.mkdir(exist_ok=True)
    data_dir.mkdir(exist_ok=True)

    print(
        "Article recommender training placeholder. "
        "Add article data and TF-IDF/cosine similarity training here."
    )


if __name__ == "__main__":
    main()
