from typing import Dict, Optional

from pydantic import BaseModel, Field


class PCOSPredictionRequest(BaseModel):
    age: Optional[float] = Field(default=None, ge=0)
    bmi: Optional[float] = Field(default=None, ge=0)
    cycle_length_days: Optional[float] = Field(default=None, ge=0)
    irregular_periods: Optional[bool] = None
    weight_gain: Optional[bool] = None
    hair_growth: Optional[bool] = None
    skin_darkening: Optional[bool] = None
    acne: Optional[bool] = None
    fast_food_frequency: Optional[float] = Field(default=None, ge=0)
    raw_features: Optional[Dict[str, float]] = None


class PCOSPredictionResponse(BaseModel):
    risk_label: str
    risk_score: Optional[float] = None
    message: str
    model_version: str
    is_placeholder: bool = True


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    environment: str
