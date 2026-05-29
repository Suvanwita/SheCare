from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class CycleIrregularityRequest(BaseModel):
    age_yrs: Optional[float] = Field(default=None, ge=0)
    average_cycle_length_days: Optional[float] = Field(default=None, ge=0)
    cycle_length_variation_days: Optional[float] = Field(default=None, ge=0)
    missed_periods_last_6_months: Optional[int] = Field(default=None, ge=0)
    stress_level: Optional[int] = Field(default=None, ge=1, le=10)
    sleep_hours: Optional[float] = Field(default=None, ge=0, le=24)
    exercise_days_per_week: Optional[int] = Field(default=None, ge=0, le=7)


class CycleIrregularityResponse(BaseModel):
    risk_level: Literal["Low", "Moderate", "High"]
    score: float
    message: str
    contributing_factors: List[str]
    is_placeholder: bool = True
    disclaimer: str


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    environment: str
