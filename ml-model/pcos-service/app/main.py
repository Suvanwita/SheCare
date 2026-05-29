from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.predictor import load_prediction_artifacts, predict_pcos_risk
from app.schemas import HealthResponse, PCOSPredictionRequest, PCOSPredictionResponse

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        load_prediction_artifacts()
        app.state.prediction_model_ready = True
        app.state.prediction_model_error = None
    except Exception as exc:
        app.state.prediction_model_ready = False
        app.state.prediction_model_error = str(exc)

    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    lifespan=lifespan,
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
    if not getattr(app.state, "prediction_model_ready", False):
        raise HTTPException(
            status_code=503,
            detail=(
                "PCOS prediction model is not ready: "
                f"{getattr(app.state, 'prediction_model_error', 'startup not completed')}"
            ),
        )

    try:
        return predict_pcos_risk(payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to generate PCOS prediction: {exc}",
        ) from exc
