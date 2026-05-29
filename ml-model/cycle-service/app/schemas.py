from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class CycleIrregularityRequest(BaseModel):
    age: Optional[float] = Field(default=None, ge=0)
    cycle_length: Optional[float] = Field(default=None, ge=0)
    period_duration: Optional[float] = Field(default=None, ge=0)
    stress_level: Optional[float] = Field(default=None, ge=0, le=10)
    sleep_hours: Optional[float] = Field(default=None, ge=0, le=24)
    exercise_frequency: Optional[float] = Field(default=None, ge=0)
    bmi: Optional[float] = Field(default=None, ge=0)
    mood_score: Optional[float] = Field(default=None, ge=0, le=10)
    pain_level: Optional[float] = Field(default=None, ge=0, le=10)
    weight_change: Optional[float] = None
    previous_cycle_length: Optional[float] = Field(default=None, ge=0)


class ContributingFactor(BaseModel):
    factor: str
    value: Optional[float] = None
    impact: float
    description: str


class CycleIrregularityResponse(BaseModel):
    probability: float
    cycle_pattern: Literal["Regular", "Irregular"]
    risk_level: Literal["Low", "Moderate", "High"]
    contributing_factors: List[ContributingFactor]
    recommendation: str
    disclaimer: str


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    environment: str
