import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd


CYCLE_SERVICE_ROOT = Path(__file__).resolve().parents[2]
DATA_PATH = CYCLE_SERVICE_ROOT / "data" / "cycle_data.csv"
MODEL_DIR = CYCLE_SERVICE_ROOT / "model"
FEATURE_COLUMNS_PATH = MODEL_DIR / "feature_columns.json"
PREPROCESSING_METADATA_PATH = MODEL_DIR / "preprocessing_metadata.json"
TARGET_COLUMN = "cycle_irregularity"

TARGET_CANDIDATES = [
    "cycle_irregularity",
    "irregularity",
    "irregular",
    "is_irregular",
    "cycle_regular",
    "regularity",
    "cycle_regularity",
    "regular_irregular",
    "cycle_status",
]

FEATURE_ALIASES = {
    "age": ["age", "age_yrs", "age_years", "user_age"],
    "cycle_length": [
        "cycle_length",
        "cycle_length_days",
        "average_cycle_length",
        "average_cycle_length_days",
        "avg_cycle_length",
        "menstrual_cycle_length",
    ],
    "period_duration": [
        "period_duration",
        "period_duration_days",
        "period_length",
        "bleeding_days",
        "menses_duration",
    ],
    "stress_level": ["stress_level", "stress", "stress_score"],
    "sleep_hours": ["sleep_hours", "sleep_duration", "hours_of_sleep"],
    "exercise_frequency": [
        "exercise_frequency",
        "exercise_days_per_week",
        "weekly_exercise",
        "physical_activity",
    ],
    "bmi": ["bmi", "body_mass_index"],
    "mood": ["mood", "mood_changes", "mood_score"],
    "pain_level": ["pain_level", "cramp_level", "cramps", "menstrual_pain"],
}


def load_cycle_dataset(path: Path = DATA_PATH) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"Cycle dataset not found at {path}")

    print(f"Loading cycle dataset from: {path}")
    df = pd.read_csv(path)
    print(f"Dataset shape: {df.shape}")
    return df


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


def preprocess_cycle_dataframe(
    df: pd.DataFrame,
) -> Tuple[pd.DataFrame, pd.Series, Dict[str, Any]]:
    cleaned_df = clean_column_names(df)
    target_source = _detect_target_column(cleaned_df)
    cycle_length_column = _find_first_existing_column(
        cleaned_df, FEATURE_ALIASES["cycle_length"]
    )

    if target_source:
        y = _normalize_target(cleaned_df[target_source])
        target_strategy = f"existing_column:{target_source}"
    else:
        if not cycle_length_column:
            raise ValueError(
                "No regularity target found and no cycle length column available "
                "to create cycle_irregularity."
            )
        y = _create_cycle_irregularity_target(cleaned_df[cycle_length_column])
        target_strategy = f"created_from_cycle_length:{cycle_length_column}"

    selected_columns = _detect_feature_columns(cleaned_df)
    if not selected_columns:
        raise ValueError("No relevant cycle irregularity feature columns were detected.")

    feature_df = cleaned_df[selected_columns].copy()
    feature_df = feature_df.replace(r"^\s*$", np.nan, regex=True)
    feature_df, imputation_values = _handle_missing_values(feature_df)
    encoded_df, categorical_columns, encoded_columns = _encode_categorical_features(
        feature_df
    )

    metadata = {
        "target_column": TARGET_COLUMN,
        "target_strategy": target_strategy,
        "selected_source_columns": selected_columns,
        "categorical_columns": categorical_columns,
        "encoded_columns": encoded_columns,
        "imputation_values": imputation_values,
        "feature_aliases": FEATURE_ALIASES,
    }

    _save_json(FEATURE_COLUMNS_PATH, list(encoded_df.columns))
    _save_json(PREPROCESSING_METADATA_PATH, metadata)

    print("Selected source features:")
    for column in selected_columns:
        print(f"- {column}")
    print("Target distribution:")
    print(y.value_counts(dropna=False).to_string())
    print(f"Final feature count: {encoded_df.shape[1]}")
    print(f"Saved feature columns to: {FEATURE_COLUMNS_PATH}")
    print(f"Saved preprocessing metadata to: {PREPROCESSING_METADATA_PATH}")

    return encoded_df, y, metadata


def _detect_target_column(df: pd.DataFrame) -> Optional[str]:
    return _find_first_existing_column(df, TARGET_CANDIDATES)


def _detect_feature_columns(df: pd.DataFrame) -> List[str]:
    selected_columns = []
    seen = set()

    for aliases in FEATURE_ALIASES.values():
        column = _find_first_existing_column(df, aliases)
        if column and column not in seen:
            selected_columns.append(column)
            seen.add(column)

    return selected_columns


def _find_first_existing_column(df: pd.DataFrame, candidates: List[str]) -> Optional[str]:
    columns = set(df.columns)
    for candidate in candidates:
        if candidate in columns:
            return candidate

    return None


def _normalize_target(series: pd.Series) -> pd.Series:
    numeric_target = pd.to_numeric(series, errors="coerce")
    if numeric_target.notna().sum() == series.notna().sum():
        return numeric_target.fillna(0).astype(int).clip(0, 1)

    normalized = series.astype(str).str.strip().str.lower()
    irregular_values = {"irregular", "yes", "y", "true", "1", "high"}
    regular_values = {"regular", "no", "n", "false", "0", "low"}

    return normalized.map(
        lambda value: 1
        if value in irregular_values
        else 0
        if value in regular_values
        else np.nan
    ).fillna(0).astype(int)


def _create_cycle_irregularity_target(cycle_length: pd.Series) -> pd.Series:
    numeric_cycle_length = pd.to_numeric(cycle_length, errors="coerce")
    median_cycle_length = numeric_cycle_length.median()

    if pd.isna(median_cycle_length):
        raise ValueError("Cycle length column cannot be used to create target.")

    numeric_cycle_length = numeric_cycle_length.fillna(median_cycle_length)
    return ((numeric_cycle_length < 21) | (numeric_cycle_length > 35)).astype(int)


def _handle_missing_values(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    filled_df = df.copy()
    imputation_values: Dict[str, Any] = {}

    for column in filled_df.columns:
        converted_series = pd.to_numeric(filled_df[column], errors="coerce")
        original_non_missing = filled_df[column].notna().sum()
        numeric_ratio = (
            converted_series.notna().sum() / original_non_missing
            if original_non_missing
            else 0
        )

        if numeric_ratio >= 0.8:
            filled_df[column] = converted_series
            fill_value = filled_df[column].median()
            if pd.isna(fill_value):
                fill_value = 0
            filled_df[column] = filled_df[column].fillna(fill_value)
            imputation_values[column] = {"strategy": "median", "value": float(fill_value)}
        else:
            mode = filled_df[column].mode(dropna=True)
            fill_value = mode.iloc[0] if not mode.empty else "unknown"
            filled_df[column] = filled_df[column].fillna(fill_value).astype(str)
            imputation_values[column] = {"strategy": "mode", "value": str(fill_value)}

    return filled_df, imputation_values


def _encode_categorical_features(
    df: pd.DataFrame,
) -> Tuple[pd.DataFrame, List[str], List[str]]:
    categorical_columns = [
        column for column in df.columns if not pd.api.types.is_numeric_dtype(df[column])
    ]
    encoded_df = pd.get_dummies(df, columns=categorical_columns, drop_first=False)
    encoded_df = encoded_df.astype(float)

    return encoded_df, categorical_columns, list(encoded_df.columns)


def _save_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as file:
        json.dump(_json_safe(payload), file, indent=2)
        file.write("\n")


def _json_safe(value: Any) -> Any:
    if isinstance(value, dict):
        return {str(key): _json_safe(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_json_safe(item) for item in value]
    if isinstance(value, np.integer):
        return int(value)
    if isinstance(value, np.floating):
        return float(value)

    return value
