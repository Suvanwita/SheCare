from pathlib import Path

import pandas as pd

from app.utils.preprocessing import preprocess_dataframe, split_features_target


ML_MODEL_ROOT = Path(__file__).resolve().parent
DATA_PATH = ML_MODEL_ROOT / "data" / "PCOS_data.csv"


def main() -> None:
    df = pd.read_csv(DATA_PATH)

    print(f"Dataset shape: {df.shape}")
    print("Missing values before preprocessing:")
    missing_values = df.isna().sum()
    missing_values = missing_values[missing_values > 0]
    print(missing_values.to_string() if not missing_values.empty else "No missing values")

    processed_df = preprocess_dataframe(df)
    print("Missing values after preprocessing:")
    processed_missing_values = processed_df.isna().sum()
    processed_missing_values = processed_missing_values[processed_missing_values > 0]
    print(
        processed_missing_values.to_string()
        if not processed_missing_values.empty
        else "No missing values"
    )

    split_features_target(processed_df)

    print("Model training is not implemented yet.")


if __name__ == "__main__":
    main()
