# SheCare Article ML Service

Independent FastAPI service for Knowledge Hub article recommendations.

## Run locally

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8002
```

## Endpoints

- `GET /health`
- `POST /similar-articles/by-slug`
- `POST /similar-articles/by-text`

Recommendation endpoints use TF-IDF vectors and cosine similarity. If model
artifacts are missing, they return an empty recommendation list.

## Train

```bash
python train_recommender.py
```
