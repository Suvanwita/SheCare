import json
from pathlib import Path
from typing import Any

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
    roc_auc_score,
)
from sklearn.model_selection import train_test_split

from app.utils.preprocessing import preprocess_dataframe, split_features_target


ML_MODEL_ROOT = Path(__file__).resolve().parent
DATA_PATH = ML_MODEL_ROOT / "data" / "PCOS_data.csv"
MODEL_DIR = ML_MODEL_ROOT / "model"
MODEL_PATH = MODEL_DIR / "pcos_random_forest.pkl"
FEATURE_COLUMNS_PATH = MODEL_DIR / "feature_columns.json"
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


def _positive_class(classes: np.ndarray) -> Any:
    return 1 if 1 in classes else classes[-1]


def _evaluate_model(
    model: RandomForestClassifier,
    X_test: pd.DataFrame,
    y_test: pd.Series,
) -> dict[str, Any]:
    y_pred = model.predict(X_test)
    positive_class = _positive_class(model.classes_)
    positive_class_index = list(model.classes_).index(positive_class)
    y_probability = model.predict_proba(X_test)[:, positive_class_index]

    return {
        "priority_note": (
            "For healthcare risk prediction, recall and F1-score should be "
            "prioritized alongside ROC-AUC instead of accuracy alone."
        ),
        "positive_class": positive_class,
        "accuracy": accuracy_score(y_test, y_pred),
        "precision": precision_score(
            y_test,
            y_pred,
            pos_label=positive_class,
            zero_division=0,
        ),
        "recall": recall_score(
            y_test,
            y_pred,
            pos_label=positive_class,
            zero_division=0,
        ),
        "f1_score": f1_score(
            y_test,
            y_pred,
            pos_label=positive_class,
            zero_division=0,
        ),
        "roc_auc": roc_auc_score(y_test, y_probability),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
        "classification_report": classification_report(
            y_test,
            y_pred,
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
    print("Starting PCOS RandomForest training pipeline")
    print(f"Loading dataset from: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)

    print(f"Dataset shape: {df.shape}")
    print("Missing values before preprocessing:")
    missing_values = df.isna().sum()
    missing_values = missing_values[missing_values > 0]
    print(missing_values.to_string() if not missing_values.empty else "No missing values")

    processed_df = preprocess_dataframe(df)
    print(f"Cleaned dataset shape: {processed_df.shape}")
    print("Missing values after preprocessing:")
    processed_missing_values = processed_df.isna().sum()
    processed_missing_values = processed_missing_values[processed_missing_values > 0]
    print(
        processed_missing_values.to_string()
        if not processed_missing_values.empty
        else "No missing values"
    )

    X, y = split_features_target(processed_df)
    feature_columns = list(X.columns)

    print("Saving feature columns")
    _save_json(FEATURE_COLUMNS_PATH, feature_columns)

    print("Creating stratified train/test split")
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )
    print(f"Training shape: X={X_train.shape}, y={y_train.shape}")
    print(f"Testing shape: X={X_test.shape}, y={y_test.shape}")

    print("Training RandomForestClassifier")
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
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
    print(f"ROC-AUC: {metrics['roc_auc']:.4f}")
    print("Confusion matrix:")
    print(np.array(metrics["confusion_matrix"]))
    print("Classification report:")
    print(classification_report(y_test, y_pred, zero_division=0))

    print(f"Saving trained model to: {MODEL_PATH}")
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)

    print(f"Saving model metrics to: {METRICS_PATH}")
    _save_json(METRICS_PATH, metrics)

    print(f"Saving feature importance to: {FEATURE_IMPORTANCE_PATH}")
    _save_feature_importance(model, feature_columns)

    print("Training pipeline complete")
    print("Healthcare priority: review recall and F1-score before relying on accuracy.")


if __name__ == "__main__":
    main()
