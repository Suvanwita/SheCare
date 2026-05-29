from pathlib import Path
from typing import Any, Optional

import joblib


def load_model(model_path: str) -> Optional[Any]:
    path = Path(model_path)
    if not path.exists():
        return None

    return joblib.load(path)
