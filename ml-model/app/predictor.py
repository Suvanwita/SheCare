from app.config import get_settings
from app.schemas import PCOSPredictionRequest, PCOSPredictionResponse
from app.utils.preprocessing import request_to_dataframe


def predict_pcos_risk(payload: PCOSPredictionRequest) -> PCOSPredictionResponse:
    settings = get_settings()

    # Keep the preprocessing call wired in so the endpoint shape is ready for
    # a trained model without doing any inference yet.
    request_to_dataframe(payload)

    return PCOSPredictionResponse(
        risk_label="not_available",
        risk_score=None,
        message="PCOS risk prediction is not available until a model is trained.",
        model_version=settings.app_version,
        is_placeholder=True,
    )
