import json
from pathlib import Path
from typing import Any, Dict, List, Optional

import joblib
import pandas as pd

from app.schemas import (
    ContributingFactor,
    PCOSPredictionRequest,
    PCOSPredictionResponse,
)
from app.utils.preprocessing import preprocess_dataframe

ML_MODEL_ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = ML_MODEL_ROOT / "model" / "pcos_random_forest.pkl"
FEATURE_COLUMNS_PATH = ML_MODEL_ROOT / "model" / "feature_columns.json"
FEATURE_IMPORTANCE_PATH = ML_MODEL_ROOT / "model" / "feature_importance.json"
DATA_PATH = ML_MODEL_ROOT / "data" / "PCOS_data.csv"
DISCLAIMER = (
    "This PCOS risk prediction is for informational support only and is not a "
    "medical diagnosis. Please consult a qualified healthcare professional for "
    "clinical evaluation and treatment decisions."
)

_model: Optional[Any] = None
_feature_columns: List[str] = []
_feature_medians: Dict[str, float] = {}
_feature_importance: Dict[str, float] = {}


def load_prediction_artifacts() -> None:
    global _model, _feature_columns, _feature_medians, _feature_importance

    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Trained model not found at {MODEL_PATH}")
    if not FEATURE_COLUMNS_PATH.exists():
        raise FileNotFoundError(f"Feature columns not found at {FEATURE_COLUMNS_PATH}")

    _model = joblib.load(MODEL_PATH)
    _feature_columns = _load_json(FEATURE_COLUMNS_PATH)
    _feature_medians = _load_feature_medians(_feature_columns)
    _feature_importance = _load_feature_importance()


def predict_pcos_risk(payload: PCOSPredictionRequest) -> PCOSPredictionResponse:
    _ensure_artifacts_loaded()

    input_row = _build_model_input(payload)
    probability = _predict_probability(input_row)
    risk_level = _risk_level(probability)

    return PCOSPredictionResponse(
        probability=round(probability, 4),
        risk_level=risk_level,
        message=_risk_message(risk_level, probability),
        top_contributing_factors=_top_contributing_factors(payload),
        recommendation=_recommendation(risk_level),
        disclaimer=DISCLAIMER,
    )


def _ensure_artifacts_loaded() -> None:
    if _model is None or not _feature_columns:
        load_prediction_artifacts()


def _load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def _load_feature_medians(feature_columns: List[str]) -> Dict[str, float]:
    medians = {feature: 0.0 for feature in feature_columns}

    if not DATA_PATH.exists():
        return medians

    try:
        df = pd.read_csv(DATA_PATH)
        processed_df = preprocess_dataframe(df)
    except Exception:
        return medians

    for feature in feature_columns:
        if feature not in processed_df.columns:
            continue

        median = processed_df[feature].median()
        if pd.notna(median):
            medians[feature] = float(median)

    return medians


def _load_feature_importance() -> Dict[str, float]:
    if not FEATURE_IMPORTANCE_PATH.exists():
        return {}

    try:
        importance_rows = _load_json(FEATURE_IMPORTANCE_PATH)
    except Exception:
        return {}

    return {
        row["feature"]: float(row["importance"])
        for row in importance_rows
        if "feature" in row and "importance" in row
    }


def _payload_to_dict(payload: PCOSPredictionRequest) -> Dict[str, Any]:
    if hasattr(payload, "model_dump"):
        return payload.model_dump(exclude_none=True)

    return payload.dict(exclude_none=True)


def _build_model_input(payload: PCOSPredictionRequest) -> pd.DataFrame:
    payload_values = _payload_to_dict(payload)
    ordered_values = {
        feature: float(payload_values.get(feature, _feature_medians.get(feature, 0.0)))
        for feature in _feature_columns
    }

    return pd.DataFrame([ordered_values], columns=_feature_columns)


def _predict_probability(input_row: pd.DataFrame) -> float:
    if _model is None:
        raise RuntimeError("Prediction model is not loaded.")

    if not hasattr(_model, "predict_proba"):
        raise RuntimeError("Prediction model does not support probability output.")

    classes = list(_model.classes_)
    positive_class = 1 if 1 in classes else classes[-1]
    positive_class_index = classes.index(positive_class)

    return float(_model.predict_proba(input_row)[0][positive_class_index])


def _risk_level(probability: float) -> str:
    if probability < 0.35:
        return "Low"
    if probability <= 0.65:
        return "Moderate"

    return "High"


def _risk_message(risk_level: str, probability: float) -> str:
    percent = round(probability * 100, 1)

    if risk_level == "Low":
        return f"The model estimates a low PCOS risk probability of {percent}%."
    if risk_level == "Moderate":
        return f"The model estimates a moderate PCOS risk probability of {percent}%."

    return f"The model estimates a high PCOS risk probability of {percent}%."


def _recommendation(risk_level: str) -> str:
    if risk_level == "Low":
        return (
            "Continue tracking menstrual cycle patterns and wellness indicators. "
            "Seek medical advice if symptoms persist or worsen."
        )
    if risk_level == "Moderate":
        return (
            "Consider discussing symptoms, cycle history, and lab values with a "
            "gynecologist or endocrinologist for appropriate follow-up."
        )

    return (
        "Schedule a clinical consultation for a full evaluation. A clinician may "
        "recommend physical examination, hormone testing, ultrasound, or other care."
    )


def _top_contributing_factors(
    payload: PCOSPredictionRequest,
    limit: int = 5,
) -> List[ContributingFactor]:
    payload_values = _payload_to_dict(payload)
    factors = []

    for feature, value in payload_values.items():
        importance = _feature_importance.get(feature, 0.0)
        factors.append(
            ContributingFactor(
                feature=feature,
                value=float(value),
                importance=round(importance, 6),
            )
        )

    factors.sort(key=lambda factor: factor.importance, reverse=True)
    return factors[:limit]
