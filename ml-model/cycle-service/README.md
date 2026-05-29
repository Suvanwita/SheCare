# SheCare Cycle ML Service

Independent FastAPI service for cycle irregularity prediction.

This service currently exposes a placeholder rule-based route. It does not share model logic with the PCOS service.

## Run Locally

```bash
cd ml-model/cycle-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

## Endpoints

- `GET /health`
- `POST /predict-cycle-irregularity`

Example:

```bash
curl -X POST "http://127.0.0.1:8001/predict-cycle-irregularity" \
  -H "Content-Type: application/json" \
  -d '{
    "age_yrs": 27,
    "average_cycle_length_days": 39,
    "cycle_length_variation_days": 9,
    "missed_periods_last_6_months": 2,
    "stress_level": 8,
    "sleep_hours": 5.5,
    "exercise_days_per_week": 2
  }'
```

## Docker

```bash
docker build -t shecare-cycle-service .
docker run -p 8001:8001 shecare-cycle-service
```

## Training

```bash
python train_model.py
```

Training is intentionally not implemented yet.
