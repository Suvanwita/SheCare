# SheCare PCOS ML Service

FastAPI-based ML service scaffold for PCOS risk prediction.

This service currently exposes a placeholder prediction endpoint. Model training and real inference are intentionally not implemented yet.

## Structure

```text
ml-model/
├── app/
│   ├── main.py
│   ├── schemas.py
│   ├── predictor.py
│   ├── config.py
│   └── utils/
│       ├── preprocessing.py
│       └── model_utils.py
├── data/
│   └── PCOS_data.csv
├── model/
├── tests/
├── train_model.py
├── requirements.txt
├── .env.example
└── README.md
```

## Setup

```bash
cd ml-model
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

## Run Locally

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

## Endpoints

- `GET /health` returns service health metadata.
- `POST /predict-pcos` returns a placeholder PCOS risk response until a trained model is added.

## Frontend CORS

CORS is configured for the Next.js frontend at `http://localhost:3000` by default.
