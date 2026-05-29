import json
from pathlib import Path
from typing import Any, Dict, List, Optional

import joblib
import pandas as pd

from app.config import get_settings
from app.schemas import (
    ContributingFactor,
    PCOSPredictionRequest,
    PCOSPredictionResponse,
)
from app.utils.preprocessing import preprocess_dataframe

ML_MODEL_ROOT = Path(__file__).resolve().parents[1]
FEATURE_IMPORTANCE_PATH = ML_MODEL_ROOT / "model" / "feature_importance.json"
DATA_PATH = ML_MODEL_ROOT / "data" / "PCOS_data.csv"
FRIENDLY_FEATURES = [
    "age_yrs",
    "weight_kg",
    "height_cm",
    "bmi",
    "cycle_r_i",
    "cycle_length_days",
    "weight_gain_y_n",
    "hair_growth_y_n",
    "skin_darkening_y_n",
    "hair_loss_y_n",
    "pimples_y_n",
    "fast_food_y_n",
    "reg_exercise_y_n",
    "follicle_no_l",
    "follicle_no_r",
    "amh_ng_ml",
    "fsh_miu_ml",
    "lh_miu_ml",
    "fsh_lh",
    "tsh_miu_l",
    "vit_d3_ng_ml",
    "waist_inch",
    "hip_inch",
    "waist_hip_ratio",
]
DISCLAIMER = (
    "This PCOS risk prediction is for informational support only and is not a "
    "medical diagnosis. Please consult a qualified healthcare professional for "
    "clinical evaluation and treatment decisions."
)

_model: Optional[Any] = None
_feature_columns: List[str] = []
_feature_medians: Dict[str, float] = {}
_feature_importance: Dict[str, float] = {}
_use_fallback_predictor = False
_artifacts_loaded = False


def load_prediction_artifacts() -> None:
    global _model, _feature_columns, _feature_medians, _feature_importance
    global _use_fallback_predictor, _artifacts_loaded

    settings = get_settings()
    model_path = _resolve_ml_path(settings.model_path)
    feature_columns_path = _resolve_ml_path(settings.feature_columns_path)

    _model = None
    _use_fallback_predictor = not model_path.exists()

    if model_path.exists():
        _model = joblib.load(model_path)

    if feature_columns_path.exists():
        _feature_columns = _load_json(feature_columns_path)
    else:
        _feature_columns = FRIENDLY_FEATURES
    _feature_medians = _load_feature_medians(_feature_columns)
    _feature_importance = _load_feature_importance()
    _artifacts_loaded = True


def reset_prediction_artifacts() -> None:
    global _model, _feature_columns, _feature_medians, _feature_importance
    global _use_fallback_predictor, _artifacts_loaded

    _model = None
    _feature_columns = []
    _feature_medians = {}
    _feature_importance = {}
    _use_fallback_predictor = False
    _artifacts_loaded = False


def predict_pcos_risk(payload: PCOSPredictionRequest) -> PCOSPredictionResponse:
    _ensure_artifacts_loaded()

    input_row = _build_model_input(payload)
    probability = (
        _fallback_probability(payload)
        if _use_fallback_predictor
        else _predict_probability(input_row)
    )
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
    if not _artifacts_loaded:
        load_prediction_artifacts()


def _resolve_ml_path(path_value: str) -> Path:
    path = Path(path_value)
    if path.is_absolute():
        return path

    return ML_MODEL_ROOT / path


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


def _fallback_probability(payload: PCOSPredictionRequest) -> float:
    values = _payload_to_dict(payload)
    rule_hits = _fallback_rule_hits(values)

    base_probability = 0.12
    probability = base_probability + sum(rule["weight"] for rule in rule_hits)
    return max(0.0, min(probability, 0.95))


def _fallback_rule_hits(values: Dict[str, Any]) -> List[Dict[str, Any]]:
    rules = [
        {
            "feature": "cycle_r_i",
            "label": "irregular_cycle",
            "weight": 0.16,
            "triggered": float(values.get("cycle_r_i", 0) or 0) >= 4,
        },
        {
            "feature": "bmi",
            "label": "high_bmi",
            "weight": 0.12,
            "triggered": float(values.get("bmi", 0) or 0) >= 25,
        },
        {
            "feature": "cycle_length_days",
            "label": "cycle_length_abnormality",
            "weight": 0.12,
            "triggered": _outside_range(values.get("cycle_length_days"), 21, 35),
        },
        {
            "feature": "weight_gain_y_n",
            "label": "weight_gain",
            "weight": 0.09,
            "triggered": _is_yes(values.get("weight_gain_y_n")),
        },
        {
            "feature": "hair_growth_y_n",
            "label": "hair_growth",
            "weight": 0.10,
            "triggered": _is_yes(values.get("hair_growth_y_n")),
        },
        {
            "feature": "skin_darkening_y_n",
            "label": "skin_darkening",
            "weight": 0.09,
            "triggered": _is_yes(values.get("skin_darkening_y_n")),
        },
        {
            "feature": "pimples_y_n",
            "label": "pimples",
            "weight": 0.06,
            "triggered": _is_yes(values.get("pimples_y_n")),
        },
        {
            "feature": "follicle_no_l",
            "label": "high_left_follicle_count",
            "weight": 0.10,
            "triggered": float(values.get("follicle_no_l", 0) or 0) >= 12,
        },
        {
            "feature": "follicle_no_r",
            "label": "high_right_follicle_count",
            "weight": 0.10,
            "triggered": float(values.get("follicle_no_r", 0) or 0) >= 12,
        },
        {
            "feature": "amh_ng_ml",
            "label": "elevated_amh",
            "weight": 0.12,
            "triggered": float(values.get("amh_ng_ml", 0) or 0) >= 4,
        },
    ]

    return [rule for rule in rules if rule["triggered"]]


def _outside_range(value: Any, lower_bound: float, upper_bound: float) -> bool:
    if value is None:
        return False

    numeric_value = float(value)
    return numeric_value < lower_bound or numeric_value > upper_bound


def _is_yes(value: Any) -> bool:
    return float(value or 0) >= 1


def _risk_level(probability: float) -> str:
    if probability < 0.35:
        return "Low"
    if probability <= 0.65:
        return "Moderate"

    return "High"


def _risk_message(risk_level: str, probability: float) -> str:
    percent = round(probability * 100, 1)
    source = "rule-based fallback" if _use_fallback_predictor else "trained model"

    if risk_level == "Low":
        return f"The {source} estimates a low PCOS risk probability of {percent}%."
    if risk_level == "Moderate":
        return f"The {source} estimates a moderate PCOS risk probability of {percent}%."

    return f"The {source} estimates a high PCOS risk probability of {percent}%."


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

    if _use_fallback_predictor:
        factors = [
            ContributingFactor(
                feature=rule["feature"],
                value=float(payload_values.get(rule["feature"], 0) or 0),
                importance=round(float(rule["weight"]), 6),
            )
            for rule in _fallback_rule_hits(payload_values)
        ]
        factors.sort(key=lambda factor: factor.importance, reverse=True)
        return factors[:limit]

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
