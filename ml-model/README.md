# SheCare ML

FastAPI ML services used by the SheCare backend.

## PCOS Service

The backend uses the PCOS service endpoint:

- `POST http://localhost:8000/predict-pcos`

Run locally:

```bash
cd ml-model/pcos-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Health check:

```bash
curl http://localhost:8000/health
```

## Env

Create `ml-model/.env` if you want a root template:

```env
PORT=8000
```

The PCOS service also supports service-local env values in `ml-model/pcos-service/.env`.
