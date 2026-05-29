import pandas as pd

from train_model import _stratify_target


def test_stratify_target_returns_none_for_single_class() -> None:
    y = pd.Series([0, 0, 0])

    assert _stratify_target(y) is None


def test_stratify_target_returns_series_when_possible() -> None:
    y = pd.Series([0, 0, 1, 1])

    assert _stratify_target(y) is y
