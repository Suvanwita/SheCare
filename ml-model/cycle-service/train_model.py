from app.utils.preprocessing import load_cycle_dataset, preprocess_cycle_dataframe


def main() -> None:
    try:
        df = load_cycle_dataset()
    except FileNotFoundError as exc:
        print(exc)
        print("Add the dataset at data/cycle_data.csv before running preprocessing.")
        return

    preprocess_cycle_dataframe(df)
    print("Cycle irregularity model training is not implemented yet.")


if __name__ == "__main__":
    main()
