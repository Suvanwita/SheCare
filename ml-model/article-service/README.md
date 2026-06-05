# SheCare Article ML Service

Independent FastAPI service for Knowledge Hub article recommendations.

## Run locally

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8002
```

## Endpoints

- `GET /health`
- `POST /retrain-recommender`
- `POST /similar-articles/by-slug`
- `POST /similar-articles/by-text`

Recommendation endpoints use TF-IDF vectors and cosine similarity. If model
artifacts are missing, they return an empty recommendation list.

`POST /retrain-recommender` runs `train_recommender.py`, saves fresh TF-IDF
artifacts, and reloads them in memory so the service does not need a restart.

## Train

```bash
python train_recommender.py
```

The training dataset is `data/articles.csv`, usually exported from the SheCare
backend Admin Tools panel.
