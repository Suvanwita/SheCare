# SheCare ML Services

This directory contains independent FastAPI ML services.

```text
ml-model/
├── pcos-service/
└── cycle-service/
```

## PCOS Service

The PCOS service contains the trained Random Forest PCOS risk model and related preprocessing pipeline.

```bash
cd ml-model/pcos-service
uvicorn app.main:app --reload --port 8000
```

Endpoints:

- `GET /health`
- `POST /predict-pcos`

## Cycle Service

The cycle service is a separate FastAPI app for cycle irregularity prediction. It currently uses placeholder rule-based logic until a dedicated model is trained.

```bash
cd ml-model/cycle-service
uvicorn app.main:app --reload --port 8001
```

Endpoints:

- `GET /health`
- `POST /predict-cycle-irregularity`

## Independence

Each service has its own `app/`, `data/`, `model/`, `tests/`, `requirements.txt`, `Dockerfile`, and `README.md`. PCOS model logic stays inside `pcos-service`; cycle irregularity logic stays inside `cycle-service`.
