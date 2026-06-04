# SheCare Article ML Service

Independent FastAPI service for Knowledge Hub article recommendations.

## Run locally

```bash
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8002
```

## Endpoints

- `GET /health`
- `POST /similar-articles`

`/similar-articles` is currently a placeholder and returns an empty recommendation list until the recommender is trained.

## Train

```bash
python train_recommender.py
```
