import json
from pathlib import Path
from typing import Any, Dict, List, Optional

import joblib
import pandas as pd

from app.config import get_settings
from app.schemas import (
    ContributingFactor,
    CycleIrregularityRequest,
    CycleIrregularityResponse,
)

CYCLE_SERVICE_ROOT = Path(__file__).resolve().parents[1]
FEATURE_IMPORTANCE_PATH = CYCLE_SERVICE_ROOT / "model" / "feature_importance.json"
DISCLAIMER = (
    "This cycle irregularity prediction is for informational support only and "
    "is not a medical diagnosis. Please consult a qualified healthcare "
    "professional for clinical evaluation and treatment decisions."
)

_model: Optional[Any] = None
_feature_columns: List[str] = []
_metadata: Dict[str, Any] = {}
_feature_defaults: Dict[str, float] = {}
_feature_importance: Dict[str, float] = {}
_use_fallback_predictor = False
_artifacts_loaded = False


def load_prediction_artifacts() -> None:
    global _model, _feature_columns, _metadata, _feature_defaults
    global _feature_importance, _use_fallback_predictor, _artifacts_loaded

    settings = get_settings()
    model_path = _resolve_service_path(settings.model_path)
    feature_columns_path = _resolve_service_path(settings.feature_columns_path)
    metadata_path = _resolve_service_path(settings.preprocessing_metadata_path)

    _model = None
    _use_fallback_predictor = not model_path.exists()

    if model_path.exists():
        _model = joblib.load(model_path)

    _feature_columns = (
        _load_json(feature_columns_path) if feature_columns_path.exists() else []
    )
    _metadata = _load_json(metadata_path) if metadata_path.exists() else {}
    _feature_defaults = _build_feature_defaults(_feature_columns, _metadata)
    _feature_importance = _load_feature_importance()
    _artifacts_loaded = True


def reset_prediction_artifacts() -> None:
    global _model, _feature_columns, _metadata, _feature_defaults
    global _feature_importance, _use_fallback_predictor, _artifacts_loaded

    _model = None
    _feature_columns = []
    _metadata = {}
    _feature_defaults = {}
    _feature_importance = {}
    _use_fallback_predictor = False
    _artifacts_loaded = False


def predict_cycle_irregularity(
    payload: CycleIrregularityRequest,
) -> CycleIrregularityResponse:
    _ensure_artifacts_loaded()

    probability = (
        _fallback_probability(payload)
        if _use_fallback_predictor or not _feature_columns
        else _model_probability(payload)
    )
    risk_level = _risk_level(probability)
    cycle_pattern = "Irregular" if probability >= 0.5 else "Regular"

    return CycleIrregularityResponse(
        probability=round(probability, 4),
        cycle_pattern=cycle_pattern,
        risk_level=risk_level,
        contributing_factors=_contributing_factors(payload),
        recommendation=_recommendation(risk_level),
        disclaimer=DISCLAIMER,
    )


def _ensure_artifacts_loaded() -> None:
    if not _artifacts_loaded:
        load_prediction_artifacts()


def _resolve_service_path(path_value: str) -> Path:
    path = Path(path_value)
    if path.is_absolute():
        return path

    return CYCLE_SERVICE_ROOT / path


def _load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def _build_feature_defaults(
    feature_columns: List[str],
    metadata: Dict[str, Any],
) -> Dict[str, float]:
    defaults = {feature: 0.0 for feature in feature_columns}
    imputation_values = metadata.get("imputation_values", {})

    source_to_feature = {
        "period_duration": "period_length",
    }

    for source_column, details in imputation_values.items():
        feature = source_to_feature.get(source_column, source_column)
        if feature in defaults and details.get("strategy") == "median":
            defaults[feature] = float(details.get("value", 0.0))

    return defaults


def _load_feature_importance() -> Dict[str, float]:
    if not FEATURE_IMPORTANCE_PATH.exists():
        return {}

    try:
        rows = _load_json(FEATURE_IMPORTANCE_PATH)
    except Exception:
        return {}

    return {
        row["feature"]: float(row["importance"])
        for row in rows
        if "feature" in row and "importance" in row
    }


def _payload_to_dict(payload: CycleIrregularityRequest) -> Dict[str, Any]:
    if hasattr(payload, "model_dump"):
        return payload.model_dump(exclude_none=True)

    return payload.dict(exclude_none=True)


def _build_model_input(payload: CycleIrregularityRequest) -> pd.DataFrame:
    values = _payload_to_dict(payload)
    row = dict(_feature_defaults)

    direct_mapping = {
        "age": "age",
        "cycle_length": "cycle_length",
        "period_duration": "period_length",
        "stress_level": "stress_level",
        "sleep_hours": "sleep_hours",
        "bmi": "bmi",
    }

    for payload_key, feature_key in direct_mapping.items():
        if payload_key in values and feature_key in row:
            row[feature_key] = float(values[payload_key])

    _apply_exercise_frequency(row, values.get("exercise_frequency"))
    return pd.DataFrame([row], columns=_feature_columns)


def _apply_exercise_frequency(row: Dict[str, float], value: Any) -> None:
    if value is None:
        return

    exercise_columns = [
        column for column in row if column.startswith("exercise_frequency_")
    ]
    for column in exercise_columns:
        row[column] = 0.0

    numeric_value = float(value)
    if numeric_value <= 1:
        bucket = "Low"
    elif numeric_value <= 3:
        bucket = "Moderate"
    else:
        bucket = "High"

    feature = f"exercise_frequency_{bucket}"
    if feature in row:
        row[feature] = 1.0


def _model_probability(payload: CycleIrregularityRequest) -> float:
    if _model is None:
        raise RuntimeError("Cycle irregularity model is not loaded.")
    if not hasattr(_model, "predict_proba"):
        raise RuntimeError("Cycle irregularity model does not support probabilities.")

    input_row = _build_model_input(payload)
    classes = list(_model.classes_)
    positive_class = 1 if 1 in classes else classes[-1]
    positive_class_index = classes.index(positive_class)
    return float(_model.predict_proba(input_row)[0][positive_class_index])


def _fallback_probability(payload: CycleIrregularityRequest) -> float:
    rule_hits = _fallback_rule_hits(payload)
    probability = 0.12 + sum(rule.impact for rule in rule_hits)
    return max(0.0, min(probability, 0.95))


def _fallback_rule_hits(payload: CycleIrregularityRequest) -> List[ContributingFactor]:
    factors: List[ContributingFactor] = []

    if payload.cycle_length is not None and (
        payload.cycle_length < 21 or payload.cycle_length > 35
    ):
        factors.append(
            ContributingFactor(
                factor="cycle_length",
                value=payload.cycle_length,
                impact=0.3,
                description="Cycle length is outside the typical 21-35 day range.",
            )
        )

    if payload.stress_level is not None and payload.stress_level >= 7:
        factors.append(
            ContributingFactor(
                factor="stress_level",
                value=payload.stress_level,
                impact=0.12,
                description="High stress may affect cycle regularity.",
            )
        )

    if payload.sleep_hours is not None and payload.sleep_hours < 6:
        factors.append(
            ContributingFactor(
                factor="sleep_hours",
                value=payload.sleep_hours,
                impact=0.1,
                description="Low sleep duration may affect hormonal rhythm.",
            )
        )

    if payload.pain_level is not None and payload.pain_level >= 7:
        factors.append(
            ContributingFactor(
                factor="pain_level",
                value=payload.pain_level,
                impact=0.1,
                description="High pain level was reported.",
            )
        )

    if (
        payload.previous_cycle_length is not None
        and payload.cycle_length is not None
        and abs(payload.cycle_length - payload.previous_cycle_length) >= 7
    ):
        factors.append(
            ContributingFactor(
                factor="previous_cycle_length",
                value=payload.previous_cycle_length,
                impact=0.16,
                description="Current cycle length differs meaningfully from the previous cycle.",
            )
        )

    if payload.exercise_frequency is not None and payload.exercise_frequency <= 1:
        factors.append(
            ContributingFactor(
                factor="exercise_frequency",
                value=payload.exercise_frequency,
                impact=0.08,
                description="Low exercise frequency was reported.",
            )
        )

    return factors


def _risk_level(probability: float) -> str:
    if probability < 0.35:
        return "Low"
    if probability <= 0.65:
        return "Moderate"

    return "High"


def _recommendation(risk_level: str) -> str:
    if risk_level == "Low":
        return "Continue tracking cycle length, symptoms, sleep, and stress patterns."
    if risk_level == "Moderate":
        return (
            "Track the next few cycles closely and consider discussing persistent "
            "irregularity with a healthcare professional."
        )

    return (
        "Consider scheduling a clinical consultation, especially if irregularity, "
        "pain, missed periods, or other symptoms persist."
    )


def _contributing_factors(
    payload: CycleIrregularityRequest,
    limit: int = 5,
) -> List[ContributingFactor]:
    if _use_fallback_predictor or not _feature_columns:
        factors = _fallback_rule_hits(payload)
        if factors:
            return factors[:limit]

    values = _payload_to_dict(payload)
    candidates = [
        _factor_from_model_feature("cycle_length", values.get("cycle_length")),
        _factor_from_model_feature("stress_level", values.get("stress_level")),
        _factor_from_model_feature("sleep_hours", values.get("sleep_hours")),
        _factor_from_model_feature("bmi", values.get("bmi")),
        _factor_from_model_feature("period_length", values.get("period_duration")),
    ]

    if values.get("pain_level") is not None:
        candidates.append(
            ContributingFactor(
                factor="pain_level",
                value=float(values["pain_level"]),
                impact=0.0,
                description="Pain level is considered by fallback rules but was not part of the trained dataset.",
            )
        )

    factors = [factor for factor in candidates if factor is not None]
    factors.sort(key=lambda factor: factor.impact, reverse=True)

    if not factors:
        return [
            ContributingFactor(
                factor="baseline",
                value=None,
                impact=0.0,
                description="No strong contributing factors were provided.",
            )
        ]

    return factors[:limit]


def _factor_from_model_feature(
    feature: str,
    value: Any,
) -> Optional[ContributingFactor]:
    if value is None:
        return None

    return ContributingFactor(
        factor=feature,
        value=float(value),
        impact=round(_feature_importance.get(feature, 0.0), 6),
        description=f"{feature.replace('_', ' ').title()} contributed to the model input.",
    )
