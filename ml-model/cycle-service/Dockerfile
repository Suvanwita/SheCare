FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV MODEL_PATH=model/cycle_irregularity_model.pkl
ENV FEATURE_COLUMNS_PATH=model/feature_columns.json
ENV PREPROCESSING_METADATA_PATH=model/preprocessing_metadata.json
ENV PORT=8001

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY data ./data
COPY model ./model
COPY train_model.py .

EXPOSE 8001

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
