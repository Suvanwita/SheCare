# SheCare PCOS ML Service

FastAPI service for PCOS risk prediction using the cleaned SheCare PCOS dataset.

The service uses a trained `RandomForestClassifier` when `model/pcos_random_forest.pkl` is available. If the model artifact is missing, the API remains available through a transparent rule-based fallback predictor.

## Dataset

The source dataset is stored at:

```text
data/PCOS_data.csv
```

The training target column is `PCOS (Y/N)`, which is cleaned to `pcos_y_n` during preprocessing.

## Setup

```bash
cd ml-model/pcos-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

## Train The Model

```bash
python train_model.py
```

Training saves:

```text
model/pcos_random_forest.pkl
model/feature_columns.json
model/model_metrics.json
model/feature_importance.json
```

## Run The API

```bash
uvicorn app.main:app --reload --port 8000
```

The API runs at `http://127.0.0.1:8000` by default.

## Endpoints

- `GET /health`
- `POST /predict-pcos`

Example prediction request:

```bash
curl -X POST "http://127.0.0.1:8000/predict-pcos" \
  -H "Content-Type: application/json" \
  -d '{
    "age_yrs": 28,
    "weight_kg": 65,
    "height_cm": 160,
    "bmi": 25.4,
    "cycle_r_i": 4,
    "cycle_length_days": 38,
    "weight_gain_y_n": 1,
    "hair_growth_y_n": 1,
    "skin_darkening_y_n": 0,
    "hair_loss_y_n": 0,
    "pimples_y_n": 1,
    "fast_food_y_n": 1,
    "reg_exercise_y_n": 0,
    "follicle_no_l": 12,
    "follicle_no_r": 13,
    "amh_ng_ml": 5.2,
    "fsh_miu_ml": 6.5,
    "lh_miu_ml": 8.1,
    "fsh_lh": 0.8,
    "tsh_miu_l": 2.1,
    "vit_d3_ng_ml": 22,
    "waist_inch": 32,
    "hip_inch": 38,
    "waist_hip_ratio": 0.84
  }'
```

Example response:

```json
{
  "probability": 0.72,
  "risk_level": "High",
  "message": "The trained model estimates a high PCOS risk probability of 72.0%.",
  "top_contributing_factors": [
    {
      "feature": "follicle_no_r",
      "value": 13.0,
      "importance": 0.194181
    }
  ],
  "recommendation": "Schedule a clinical consultation for a full evaluation. A clinician may recommend physical examination, hormone testing, ultrasound, or other care.",
  "disclaimer": "This PCOS risk prediction is for informational support only and is not a medical diagnosis. Please consult a qualified healthcare professional for clinical evaluation and treatment decisions."
}
```

Risk levels:

- `Low`: probability `< 0.35`
- `Moderate`: probability `0.35` to `0.65`
- `High`: probability `> 0.65`

## Docker

```bash
docker build -t shecare-pcos-service .
docker run --env-file .env -p 8000:8000 shecare-pcos-service
```

## Tests

```bash
pytest
```

## Model Choice

Random Forest is used because the dataset is tabular, contains a mix of clinical measurements and binary symptom indicators, and benefits from a model that can capture non-linear feature interactions without heavy preprocessing. The service reports recall and F1-score because this is a healthcare risk feature where missed risk signals matter more than accuracy alone.

## Configuration

`.env.example` includes:

```text
MODEL_PATH=model/pcos_random_forest.pkl
FEATURE_COLUMNS_PATH=model/feature_columns.json
PORT=8000
```

CORS is configured for the Next.js frontend at `http://localhost:3000` by default.
