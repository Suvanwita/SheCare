import json
from pathlib import Path
from typing import Any, Optional

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split

from app.utils.preprocessing import load_cycle_dataset, preprocess_cycle_dataframe


CYCLE_SERVICE_ROOT = Path(__file__).resolve().parent
MODEL_DIR = CYCLE_SERVICE_ROOT / "model"
MODEL_PATH = MODEL_DIR / "cycle_irregularity_model.pkl"
METRICS_PATH = MODEL_DIR / "model_metrics.json"
FEATURE_IMPORTANCE_PATH = MODEL_DIR / "feature_importance.json"


def _to_json_safe(value: Any) -> Any:
    if isinstance(value, dict):
        return {str(key): _to_json_safe(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_to_json_safe(item) for item in value]
    if isinstance(value, np.ndarray):
        return _to_json_safe(value.tolist())
    if isinstance(value, np.integer):
        return int(value)
    if isinstance(value, np.floating):
        return float(value)

    return value


def _save_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as file:
        json.dump(_to_json_safe(payload), file, indent=2)
        file.write("\n")


def _stratify_target(y: pd.Series) -> Optional[pd.Series]:
    class_counts = y.value_counts()
    if len(class_counts) < 2:
        print("Skipping stratified split because only one target class is present.")
        return None
    if class_counts.min() < 2:
        print("Skipping stratified split because a class has fewer than 2 samples.")
        return None

    return y


def _evaluate_model(
    model: RandomForestClassifier,
    X_test: pd.DataFrame,
    y_test: pd.Series,
) -> dict[str, Any]:
    y_pred = model.predict(X_test)

    return {
        "priority_note": (
            "For cycle irregularity detection, recall for class 1 "
            "(irregular cycle) should be prioritized alongside F1-score."
        ),
        "positive_class": 1,
        "accuracy": accuracy_score(y_test, y_pred),
        "precision": precision_score(y_test, y_pred, pos_label=1, zero_division=0),
        "recall": recall_score(y_test, y_pred, pos_label=1, zero_division=0),
        "f1_score": f1_score(y_test, y_pred, pos_label=1, zero_division=0),
        "confusion_matrix": confusion_matrix(y_test, y_pred, labels=[0, 1]).tolist(),
        "classification_report": classification_report(
            y_test,
            y_pred,
            labels=[0, 1],
            target_names=["regular", "irregular"],
            zero_division=0,
            output_dict=True,
        ),
    }


def _save_feature_importance(
    model: RandomForestClassifier,
    feature_columns: list[str],
) -> None:
    feature_importance = sorted(
        [
            {"feature": feature, "importance": importance}
            for feature, importance in zip(feature_columns, model.feature_importances_)
        ],
        key=lambda item: item["importance"],
        reverse=True,
    )

    _save_json(FEATURE_IMPORTANCE_PATH, feature_importance)


def main() -> None:
    print("Starting cycle irregularity RandomForest training pipeline")

    try:
        df = load_cycle_dataset()
    except FileNotFoundError as exc:
        print(exc)
        print("Add the dataset at data/cycle_data.csv before running training.")
        return

    X, y, metadata = preprocess_cycle_dataframe(df)
    print(f"Preprocessed feature matrix shape: {X.shape}")
    print(f"Target strategy: {metadata['target_strategy']}")
    print("Training target classes: 0 = Regular cycle, 1 = Irregular cycle")

    stratify = _stratify_target(y)
    print("Creating train/test split")
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=stratify,
    )
    print(f"Training shape: X={X_train.shape}, y={y_train.shape}")
    print(f"Testing shape: X={X_test.shape}, y={y_test.shape}")

    print("Training RandomForestClassifier")
    model = RandomForestClassifier(
        n_estimators=200,
        class_weight="balanced",
        random_state=42,
    )
    model.fit(X_train, y_train)

    print("Evaluating model")
    metrics = _evaluate_model(model, X_test, y_test)
    y_pred = model.predict(X_test)

    print(f"Accuracy: {metrics['accuracy']:.4f}")
    print(f"Precision: {metrics['precision']:.4f}")
    print(f"Recall: {metrics['recall']:.4f}")
    print(f"F1-score: {metrics['f1_score']:.4f}")
    print("Confusion matrix [labels: 0=regular, 1=irregular]:")
    print(np.array(metrics["confusion_matrix"]))
    print("Classification report:")
    print(
        classification_report(
            y_test,
            y_pred,
            labels=[0, 1],
            target_names=["regular", "irregular"],
            zero_division=0,
        )
    )

    print(f"Saving trained model to: {MODEL_PATH}")
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)

    print(f"Saving model metrics to: {METRICS_PATH}")
    _save_json(METRICS_PATH, metrics)

    print(f"Saving feature importance to: {FEATURE_IMPORTANCE_PATH}")
    _save_feature_importance(model, list(X.columns))

    print("Training pipeline complete")
    print("Healthcare priority: review irregular-cycle recall before relying on accuracy.")


if __name__ == "__main__":
    main()
