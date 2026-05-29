from app import predictor
from app.main import app, health_check, predict_cycle
from app.schemas import CycleIrregularityRequest


VALID_PAYLOAD = {
    "age": 29,
    "cycle_length": 39,
    "period_duration": 6,
    "stress_level": 8,
    "sleep_hours": 5.5,
    "exercise_frequency": 1,
    "bmi": 26.4,
    "mood_score": 7,
    "pain_level": 8,
    "weight_change": 2.5,
    "previous_cycle_length": 28,
}


def _prepare_app_state() -> None:
    predictor.reset_prediction_artifacts()
    predictor.load_prediction_artifacts()
    app.state.prediction_model_ready = True
    app.state.prediction_model_error = None


def test_health_check() -> None:
    response = health_check()

    assert response.status == "ok"
    assert response.service == "SheCare Cycle ML Service"


def test_predict_cycle_irregularity() -> None:
    _prepare_app_state()

    response = predict_cycle(CycleIrregularityRequest(**VALID_PAYLOAD))

    assert 0 <= response.probability <= 1
    assert response.cycle_pattern in {"Regular", "Irregular"}
    assert response.risk_level in {"Low", "Moderate", "High"}
    assert response.contributing_factors
    assert "not a medical diagnosis" in response.disclaimer


def test_rule_based_fallback_predictor(monkeypatch) -> None:
    monkeypatch.setattr(predictor, "_model", None)
    monkeypatch.setattr(predictor, "_feature_columns", [])
    monkeypatch.setattr(predictor, "_feature_defaults", {})
    monkeypatch.setattr(predictor, "_feature_importance", {})
    monkeypatch.setattr(predictor, "_use_fallback_predictor", True)
    monkeypatch.setattr(predictor, "_artifacts_loaded", True)

    response = predictor.predict_cycle_irregularity(
        CycleIrregularityRequest(**VALID_PAYLOAD)
    )

    assert response.risk_level == "High"
    assert response.probability > 0.65
    assert response.cycle_pattern == "Irregular"
    assert response.contributing_factors
