# SheCare Operational Runbook

This runbook helps run, verify, troubleshoot, and recover SheCare in local or production-like environments.

## Quick Status Commands

```bash
docker compose ps
curl http://localhost:5000/health
curl http://localhost:5000/readyz
curl http://localhost:8000/health
curl http://localhost:8001/health
curl http://localhost:8002/health
```

Backend checks:

```bash
cd backend
npm test
```

Frontend checks:

```bash
cd frontend
npm run lint
npm run build
```

ML checks:

```bash
cd ml-model/pcos-service && ../.venv/bin/pytest tests
cd ../cycle-service && ../.venv/bin/pytest tests
cd ../article-service && ../.venv/bin/pytest tests
```

## Health And Readiness

| Endpoint | Meaning | Healthy response |
| --- | --- | --- |
| `GET /health` | Backend process is alive | `200` |
| `GET /readyz` | Backend dependencies are ready | `200` when MongoDB and Redis are ready |
| `GET :8000/health` | PCOS ML service ready | `200` |
| `GET :8001/health` | Cycle ML service ready | `200` |
| `GET :8002/health` | Article ML service ready | `200` |

Readiness dependencies:

- MongoDB ready state is connected.
- Redis responds to `PING`.

## Process Inventory

| Process | Start command | Dependency |
| --- | --- | --- |
| Backend API | `cd backend && npm run dev` | MongoDB, Redis, env |
| Reminder worker | `cd backend && npm run worker:reminders` | MongoDB, Redis |
| Notification worker | `cd backend && npm run worker:notifications` | MongoDB, Redis |
| Audit consumer | `cd backend && npm run consumer:audit` | MongoDB, Kafka |
| Analytics consumer | `cd backend && npm run consumer:analytics` | MongoDB, Kafka |
| Frontend | `cd frontend && npm run dev` | Backend API |
| PCOS ML | `cd ml-model/pcos-service && uvicorn app.main:app --reload --port 8000` | Model artifacts or fallback |
| Cycle ML | `cd ml-model/cycle-service && uvicorn app.main:app --reload --port 8001` | Model artifacts |
| Article ML | `cd ml-model/article-service && uvicorn app.main:app --reload --port 8002` | Recommender artifacts |

## Common Failures

### Backend `/readyz` Returns `503`

Likely causes:

- MongoDB is not running.
- `MONGO_URI` is wrong.
- Redis is not running.
- `REDIS_URL` is wrong.

Actions:

```bash
docker compose ps redis
docker compose logs redis
```

Check MongoDB separately:

```bash
mongosh mongodb://127.0.0.1:27017/shecare
```

Restart backend after fixing env.

### Auth Requests Fail

Symptoms:

- Login returns `401`.
- Protected routes return `401`.
- Token refresh fails.

Likely causes:

- Wrong password.
- User inactive.
- Missing `Authorization: Bearer <token>`.
- `JWT_ACCESS_SECRET` changed after token was issued.
- Refresh session revoked or expired.
- `JWT_REFRESH_SECRET` changed.

Actions:

1. Log out and log in again.
2. Verify backend `.env`.
3. Check user `isActive`.
4. Inspect `sessions` collection for revoked/expired sessions.

### CORS Blocked

Symptoms:

- Browser console shows CORS error.
- API works with curl but not frontend.

Likely causes:

- Frontend origin is not in `CLIENT_URL` or `CLIENT_URLS`.
- Backend was not restarted after env change.

Actions:

```env
CLIENT_URL=http://localhost:3000
CLIENT_URLS=http://localhost:3000
```

Restart backend.

### Redis Or Queue Failure

Symptoms:

- Reminder creation/update/delete returns service unavailable.
- Notification jobs do not run.
- Rate limiter logs Redis errors.

Actions:

```bash
docker compose ps redis
docker compose logs redis
curl http://localhost:5000/readyz
```

Restart workers after Redis is healthy:

```bash
cd backend
npm run worker:reminders
npm run worker:notifications
```

### Kafka Events Missing

Symptoms:

- Timeline is empty.
- Audit logs do not update from Kafka events.
- Consumers log connection errors.

Likely causes:

- Kafka/Zookeeper not running.
- Topics not initialized.
- Consumers not running.
- `KAFKA_BROKERS` wrong.

Actions:

```bash
docker compose ps zookeeper kafka
docker compose logs kafka
cd backend
npm run kafka:init
npm run consumer:analytics
npm run consumer:audit
```

Note:

- API requests continue when Kafka emit fails.
- Missing Kafka does not necessarily break the original user action.

### PCOS Prediction Returns `503`

Likely causes:

- PCOS ML service is down.
- `ML_SERVICE_URL` is wrong.
- ML request timed out.

Actions:

```bash
curl http://localhost:8000/health
cd ml-model/pcos-service
uvicorn app.main:app --reload --port 8000
```

Verify backend env:

```env
ML_SERVICE_URL=http://localhost:8000
```

### Similar Articles Missing

Likely causes:

- Article ML service is down.
- Recommender artifacts are missing.
- Article catalog is too small.
- Cache contains old response.

Actions:

```bash
curl http://localhost:8002/health
cd ml-model/article-service
python train_recommender.py
uvicorn app.main:app --reload --port 8002
```

Admin can also retrain recommender through admin article/tool endpoints.

### Report Upload Fails

Likely causes:

- File type not allowed.
- File extension not allowed.
- File exceeds `5 MB`.
- Upload directory cannot be written.
- Missing bearer token.

Allowed:

- PDF
- JPG/JPEG
- PNG

Actions:

```bash
ls -la backend/uploads/reports
```

Check backend logs for Multer errors.

### Frontend Build Fails

Actions:

```bash
cd frontend
npm install
npm run lint
npm run build
```

Common causes:

- Type mismatch in service/store types.
- Missing env variable for client-side API URL.
- Broken import path.

### ML Test Or Training Fails

Actions:

```bash
cd ml-model
python3 -m venv .venv
.venv/bin/pip install -r pcos-service/requirements.txt
.venv/bin/pip install -r cycle-service/requirements.txt
.venv/bin/pip install -r article-service/requirements.txt
```

Then rerun tests.

Common causes:

- Missing dependencies.
- Missing CSV dataset.
- Missing/corrupt model artifacts.
- Running from wrong working directory.

## Routine Operations

### Seed Local Data

```bash
cd backend
npm run seed:doctors
npm run seed:articles
```

### Initialize Kafka Topics

```bash
cd backend
npm run kafka:init
```

### Retrain PCOS Model

```bash
cd ml-model/pcos-service
../.venv/bin/python train_model.py
```

Outputs:

- `model/pcos_random_forest.pkl`
- `model/feature_columns.json`
- `model/model_metrics.json`
- `model/feature_importance.json`

### Retrain Cycle Model

```bash
cd ml-model/cycle-service
../.venv/bin/python train_model.py
```

Outputs:

- `model/cycle_irregularity_model.pkl`
- `model/feature_columns.json`
- `model/model_metrics.json`
- `model/feature_importance.json`
- `model/preprocessing_metadata.json`

### Retrain Article Recommender

```bash
cd ml-model/article-service
../.venv/bin/python train_recommender.py
```

Outputs:

- `model/tfidf_vectorizer.pkl`
- `model/article_vectors.pkl`
- `model/articles_metadata.json`

## Log Locations

Local logs are process stdout/stderr.

Docker logs:

```bash
docker compose logs redis
docker compose logs zookeeper
docker compose logs kafka
```

Application logs:

- Backend terminal.
- Worker terminals.
- Consumer terminals.
- ML service terminals.
- Frontend terminal.

## Graceful Shutdown

Backend handles:

- Kafka producer disconnect.
- Queue closure.
- Rate-limit Redis client closure.
- Redis closure.
- MongoDB closure.

Workers and consumers handle:

- Worker/consumer disconnect.
- Redis or Kafka connection closure.
- MongoDB closure.

Use `Ctrl+C` locally and wait for shutdown messages.

## Escalation Checklist

When a production-like issue happens, collect:

- Exact endpoint and method.
- Response status and body.
- Backend logs around request ID if available.
- Worker/consumer logs.
- `/readyz` output.
- Docker container status.
- Recent env changes.
- Recent model artifact changes.
- Kafka consumer status/lag where available.

