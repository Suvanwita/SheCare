import re


def normalize_text(value: str) -> str:
    text = str(value or "").strip().lower()
    text = re.sub(r"\s+", " ", text)
    return text


def combine_text_fields(*values: object) -> str:
    parts = []

    for value in values:
        if isinstance(value, list):
            parts.extend(str(item) for item in value if item)
        elif value:
            parts.append(str(value))

    return normalize_text(" ".join(parts))
