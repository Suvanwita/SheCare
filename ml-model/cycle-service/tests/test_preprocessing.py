import json

import pandas as pd

from app.utils import preprocessing


def test_preprocess_cycle_dataframe_creates_target_and_artifacts(
    tmp_path,
    monkeypatch,
) -> None:
    feature_columns_path = tmp_path / "feature_columns.json"
    metadata_path = tmp_path / "preprocessing_metadata.json"
    monkeypatch.setattr(preprocessing, "FEATURE_COLUMNS_PATH", feature_columns_path)
    monkeypatch.setattr(preprocessing, "PREPROCESSING_METADATA_PATH", metadata_path)

    df = pd.DataFrame(
        {
            " Age ": [24, 31, None],
            "Cycle Length Days": [28, 42, 18],
            "Period Duration": [5, None, 7],
            "Stress Level": [4, 9, 7],
            "Sleep Hours": [7.5, 5, None],
            "Exercise Frequency": [3, 0, 2],
            "BMI": [22.4, 28.1, None],
            "Mood": ["stable", "anxious", None],
            "Pain Level": [2, 8, 6],
        }
    )

    X, y, metadata = preprocessing.preprocess_cycle_dataframe(df)

    assert list(y) == [0, 1, 1]
    assert X.isna().sum().sum() == 0
    assert "mood_stable" in X.columns
    assert metadata["target_strategy"] == "created_from_cycle_length:cycle_length_days"
    assert feature_columns_path.exists()
    assert metadata_path.exists()

    saved_features = json.loads(feature_columns_path.read_text(encoding="utf-8"))
    assert saved_features == list(X.columns)
