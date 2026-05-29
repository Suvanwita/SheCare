import pytest
from pydantic import ValidationError

from app import predictor
from app.main import app, health_check, predict_pcos
from app.schemas import PCOSPredictionRequest


VALID_PAYLOAD = {
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
    "waist_hip_ratio": 0.84,
}


def _prepare_app_state() -> None:
    predictor.reset_prediction_artifacts()
    predictor.load_prediction_artifacts()
    app.state.prediction_model_ready = True
    app.state.prediction_model_error = None


def test_health_endpoint() -> None:
    response = health_check()

    assert response.status == "ok"


def test_predict_pcos_with_valid_payload() -> None:
    _prepare_app_state()

    response = predict_pcos(PCOSPredictionRequest(**VALID_PAYLOAD))

    assert 0 <= response.probability <= 1
    assert response.risk_level in {"Low", "Moderate", "High"}
    assert response.top_contributing_factors
    assert "not a medical diagnosis" in response.disclaimer


def test_predict_pcos_with_invalid_payload() -> None:
    invalid_payload = VALID_PAYLOAD | {"age_yrs": -1}

    with pytest.raises(ValidationError):
        PCOSPredictionRequest(**invalid_payload)


def test_rule_based_fallback_predictor(monkeypatch) -> None:
    monkeypatch.setattr(predictor, "_model", None)
    monkeypatch.setattr(predictor, "_feature_columns", predictor.FRIENDLY_FEATURES)
    monkeypatch.setattr(
        predictor,
        "_feature_medians",
        {feature: 0.0 for feature in predictor.FRIENDLY_FEATURES},
    )
    monkeypatch.setattr(predictor, "_feature_importance", {})
    monkeypatch.setattr(predictor, "_use_fallback_predictor", True)
    monkeypatch.setattr(predictor, "_artifacts_loaded", True)

    response = predictor.predict_pcos_risk(PCOSPredictionRequest(**VALID_PAYLOAD))

    assert response.risk_level == "High"
    assert response.probability > 0.65
    assert response.top_contributing_factors
    assert "rule-based fallback" in response.message
