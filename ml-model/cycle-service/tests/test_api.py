from app.main import health_check, predict_cycle
from app.schemas import CycleIrregularityRequest


def test_health_check() -> None:
    response = health_check()

    assert response.status == "ok"
    assert response.service == "SheCare Cycle ML Service"


def test_predict_cycle_irregularity_placeholder() -> None:
    response = predict_cycle(
        CycleIrregularityRequest(
            average_cycle_length_days=39,
            cycle_length_variation_days=9,
            missed_periods_last_6_months=2,
            stress_level=8,
            sleep_hours=5.5,
        )
    )

    assert response.is_placeholder is True
    assert response.risk_level in {"Low", "Moderate", "High"}
    assert response.contributing_factors
