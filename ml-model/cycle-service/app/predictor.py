from app.schemas import CycleIrregularityRequest, CycleIrregularityResponse

DISCLAIMER = (
    "This cycle irregularity estimate is informational only and is not a "
    "medical diagnosis. Please consult a qualified healthcare professional "
    "for clinical evaluation."
)


def predict_cycle_irregularity(
    payload: CycleIrregularityRequest,
) -> CycleIrregularityResponse:
    score = 0.1
    factors: list[str] = []

    if payload.average_cycle_length_days is not None and (
        payload.average_cycle_length_days < 21
        or payload.average_cycle_length_days > 35
    ):
        score += 0.25
        factors.append("Average cycle length is outside the typical 21-35 day range.")

    if (
        payload.cycle_length_variation_days is not None
        and payload.cycle_length_variation_days >= 7
    ):
        score += 0.2
        factors.append("Cycle length variation is elevated.")

    if (
        payload.missed_periods_last_6_months is not None
        and payload.missed_periods_last_6_months >= 2
    ):
        score += 0.2
        factors.append("Multiple missed periods were reported.")

    if payload.stress_level is not None and payload.stress_level >= 7:
        score += 0.1
        factors.append("High stress level may affect cycle regularity.")

    if payload.sleep_hours is not None and payload.sleep_hours < 6:
        score += 0.08
        factors.append("Low sleep duration may affect hormonal rhythm.")

    score = min(score, 0.95)
    risk_level = "High" if score > 0.65 else "Moderate" if score >= 0.35 else "Low"

    if not factors:
        factors.append("No strong irregularity signals were provided.")

    return CycleIrregularityResponse(
        risk_level=risk_level,
        score=round(score, 4),
        message=(
            "Cycle irregularity prediction is currently using placeholder "
            "rule-based logic until a dedicated model is trained."
        ),
        contributing_factors=factors,
        is_placeholder=True,
        disclaimer=DISCLAIMER,
    )
