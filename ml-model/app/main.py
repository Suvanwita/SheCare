from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.predictor import predict_pcos_risk
from app.schemas import HealthResponse, PCOSPredictionRequest, PCOSPredictionResponse

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


@app.post("/predict-pcos", response_model=PCOSPredictionResponse)
def predict_pcos(payload: PCOSPredictionRequest) -> PCOSPredictionResponse:
    return predict_pcos_risk(payload)
