import json
import re
from pathlib import Path
from typing import Any, Dict, Tuple

import numpy as np
import pandas as pd

from app.schemas import PCOSPredictionRequest

TARGET_COLUMN = "pcos_y_n"
DROP_COLUMNS = {"sl_no", "patient_file_no", "unnamed_44"}
ML_MODEL_ROOT = Path(__file__).resolve().parents[2]
FEATURE_COLUMNS_PATH = ML_MODEL_ROOT / "model" / "feature_columns.json"


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


def clean_column_names(df: pd.DataFrame) -> pd.DataFrame:
    cleaned_df = df.copy()
    cleaned_columns = []

    for column in cleaned_df.columns:
        cleaned_column = str(column).strip().lower()
        cleaned_column = re.sub(r"[^a-z0-9]+", "_", cleaned_column)
        cleaned_column = re.sub(r"_+", "_", cleaned_column).strip("_")
        cleaned_columns.append(cleaned_column)

    cleaned_df.columns = cleaned_columns
    return cleaned_df


def _convert_numeric_columns(df: pd.DataFrame) -> pd.DataFrame:
    converted_df = df.copy()

    for column in converted_df.columns:
        series = converted_df[column]

        if pd.api.types.is_numeric_dtype(series):
            continue

        numeric_series = pd.to_numeric(series, errors="coerce")
        non_missing_count = series.notna().sum()

        if non_missing_count == 0 or numeric_series.notna().sum() == non_missing_count:
            converted_df[column] = numeric_series

    return converted_df


def _is_binary_or_categorical(series: pd.Series) -> bool:
    if not pd.api.types.is_numeric_dtype(series):
        return True

    unique_values = series.dropna().unique()
    return len(unique_values) <= 2


def _fill_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    filled_df = df.copy()

    for column in filled_df.columns:
        series = filled_df[column]

        if not series.isna().any():
            continue

        if _is_binary_or_categorical(series):
            mode = series.mode(dropna=True)
            fill_value = mode.iloc[0] if not mode.empty else 0
        else:
            fill_value = series.median()
            if pd.isna(fill_value):
                fill_value = 0

        filled_df[column] = series.fillna(fill_value)

    return filled_df


def preprocess_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    processed_df = clean_column_names(df)
    processed_df = processed_df.drop(
        columns=[column for column in DROP_COLUMNS if column in processed_df.columns]
    )
    processed_df = processed_df.replace(r"^\s*$", np.nan, regex=True)
    processed_df = _convert_numeric_columns(processed_df)
    processed_df = _fill_missing_values(processed_df)
    processed_df = _convert_numeric_columns(processed_df)

    return processed_df


def split_features_target(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    if TARGET_COLUMN not in df.columns:
        raise ValueError(f"Target column '{TARGET_COLUMN}' not found after preprocessing.")

    X = df.drop(columns=[TARGET_COLUMN])
    y = df[TARGET_COLUMN]

    FEATURE_COLUMNS_PATH.parent.mkdir(parents=True, exist_ok=True)
    with FEATURE_COLUMNS_PATH.open("w", encoding="utf-8") as feature_file:
        json.dump(list(X.columns), feature_file, indent=2)
        feature_file.write("\n")

    print("Target distribution:")
    print(y.value_counts(dropna=False).to_string())
    print(f"Final feature count: {X.shape[1]}")
    print(f"Saved feature columns to: {FEATURE_COLUMNS_PATH}")

    return X, y
