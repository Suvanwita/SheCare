from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.predictor import predict_cycle_irregularity
from app.schemas import (
    CycleIrregularityRequest,
    CycleIrregularityResponse,
    HealthResponse,
)

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service=settings.app_name,
        version=settings.app_version,
        environment=settings.environment,
    )


@app.post(
    "/predict-cycle-irregularity",
    response_model=CycleIrregularityResponse,
)
def predict_cycle(
    payload: CycleIrregularityRequest,
) -> CycleIrregularityResponse:
    try:
        return predict_cycle_irregularity(payload)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to generate cycle irregularity prediction: {exc}",
        ) from exc
