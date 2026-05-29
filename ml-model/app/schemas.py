from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class PCOSPredictionRequest(BaseModel):
    age_yrs: Optional[float] = Field(default=None, ge=0)
    weight_kg: Optional[float] = Field(default=None, ge=0)
    height_cm: Optional[float] = Field(default=None, ge=0)
    bmi: Optional[float] = Field(default=None, ge=0)
    cycle_r_i: Optional[float] = Field(default=None, ge=0)
    cycle_length_days: Optional[float] = Field(default=None, ge=0)
    weight_gain_y_n: Optional[float] = Field(default=None, ge=0)
    hair_growth_y_n: Optional[float] = Field(default=None, ge=0)
    skin_darkening_y_n: Optional[float] = Field(default=None, ge=0)
    hair_loss_y_n: Optional[float] = Field(default=None, ge=0)
    pimples_y_n: Optional[float] = Field(default=None, ge=0)
    fast_food_y_n: Optional[float] = Field(default=None, ge=0)
    reg_exercise_y_n: Optional[float] = Field(default=None, ge=0)
    follicle_no_l: Optional[float] = Field(default=None, ge=0)
    follicle_no_r: Optional[float] = Field(default=None, ge=0)
    amh_ng_ml: Optional[float] = Field(default=None, ge=0)
    fsh_miu_ml: Optional[float] = Field(default=None, ge=0)
    lh_miu_ml: Optional[float] = Field(default=None, ge=0)
    fsh_lh: Optional[float] = Field(default=None, ge=0)
    tsh_miu_l: Optional[float] = Field(default=None, ge=0)
    vit_d3_ng_ml: Optional[float] = Field(default=None, ge=0)
    waist_inch: Optional[float] = Field(default=None, ge=0)
    hip_inch: Optional[float] = Field(default=None, ge=0)
    waist_hip_ratio: Optional[float] = Field(default=None, ge=0)


class ContributingFactor(BaseModel):
    feature: str
    value: float
    importance: float


class PCOSPredictionResponse(BaseModel):
    probability: float
    risk_level: Literal["Low", "Moderate", "High"]
    message: str
    top_contributing_factors: List[ContributingFactor]
    recommendation: str
    disclaimer: str


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    environment: str
