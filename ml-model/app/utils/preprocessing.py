from typing import Any, Dict

import pandas as pd

from app.schemas import PCOSPredictionRequest


def request_to_dataframe(payload: PCOSPredictionRequest) -> pd.DataFrame:
    """Convert API input into a one-row DataFrame for future model inference."""
    if hasattr(payload, "model_dump"):
        data: Dict[str, Any] = payload.model_dump(exclude_none=True)
    else:
        data = payload.dict(exclude_none=True)

    raw_features = data.pop("raw_features", None)

    if raw_features:
        data.update(raw_features)

    return pd.DataFrame([data])
