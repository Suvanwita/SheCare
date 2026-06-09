# SheCare Backend

Express and MongoDB API for SheCare.

## Env Variables

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/shecare
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:3000
CLIENT_URLS=http://localhost:3000
TRUST_PROXY=0
JSON_BODY_LIMIT=1mb
ML_SERVICE_URL=http://localhost:8000
ARTICLE_ML_SERVICE_URL=http://localhost:8002
ALLOW_ADMIN_SEED_TOOLS=false
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379
REDIS_CONNECT_TIMEOUT_MS=10000
REDIS_MAX_RETRIES_PER_REQUEST=2
KAFKA_CLIENT_ID=shecare-backend
KAFKA_BROKERS=localhost:9092
KAFKA_CONNECTION_TIMEOUT_MS=5000
KAFKA_REQUEST_TIMEOUT_MS=30000
KAFKA_RETRIES=3
MONGO_MAX_POOL_SIZE=20
MONGO_SERVER_SELECTION_TIMEOUT_MS=10000
```

Optional auth expiry vars default in code:

```env
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
```

## Run Commands

```bash
npm install
npm run dev
npm test
npm run seed:doctors
node scripts/seedArticles.js
```

Core service scripts:

```bash
npm run dev
npm run worker:reminders
npm run worker:notifications
npm run consumer:audit
npm run consumer:analytics
npm run kafka:init
```

## Infrastructure

Redis, Zookeeper, and Kafka are defined in the root `docker-compose.yml`.

```bash
cd ..
docker compose up -d redis zookeeper kafka
cd backend
npm run kafka:init
```

Local service endpoints:

- Redis: `redis://localhost:6379`
- Kafka broker: `localhost:9092`

### Architecture

```text
Frontend
  |
  v
Express API
  |-- MongoDB: source of truth for users, reminders, appointments, reports, articles, analytics, audit logs
  |-- Redis: cache, rate-limit counters, BullMQ job storage
  |-- BullMQ reminderQueue -> reminder worker -> notificationQueue
  |-- BullMQ notificationQueue -> notification worker -> Notification documents
  |-- Kafka producer -> domain topics
        |-- audit consumer -> AuditLog documents
        |-- analytics consumer -> AnalyticsEvent documents -> /api/timeline
```

Kafka is intentionally non-blocking for API requests. If Kafka is unavailable,
controllers log a warning and continue returning the normal API response. Redis
cache failures are fail-open for read-heavy endpoints. Redis queue failures return
clear `503` responses because the requested background job could not be safely
scheduled.

### Start Workers

Run each worker in a separate terminal from `backend/`:

```bash
npm run worker:reminders
npm run worker:notifications
```

Reminder jobs are processed from `reminderQueue`. Due reminders enqueue
notification jobs instead of writing notifications directly. Notification jobs
create individual, targeted, and global announcement notifications.

### Start Consumers

Run each Kafka consumer in a separate terminal from `backend/`:

```bash
npm run consumer:audit
npm run consumer:analytics
```

The audit consumer subscribes to `audit.events` and `admin.events`. The analytics
consumer subscribes to user, appointment, reminder, report, PCOS, and article
topics and stores normalized `AnalyticsEvent` documents.

### Sample Kafka Events

All emitted events use this base format:

```json
{
  "eventType": "appointment.booked",
  "entityId": "665f1d6b6e6a9f2b7b1c1234",
  "userId": "665f1d6b6e6a9f2b7b1c5678",
  "role": "patient",
  "timestamp": "2026-06-09T10:30:00.000Z",
  "payload": {
    "doctorId": "665f1d6b6e6a9f2b7b1c9012",
    "date": "2026-06-10T00:00:00.000Z",
    "slot": "10:00 AM",
    "status": "pending",
    "appointmentType": "consultation"
  }
}
```

PCOS analytics payloads are sanitized before storage:

```json
{
  "eventType": "pcos.assessment.completed",
  "entityId": "665f1d6b6e6a9f2b7b1c4321",
  "userId": "665f1d6b6e6a9f2b7b1c5678",
  "role": "patient",
  "timestamp": "2026-06-09T10:45:00.000Z",
  "payload": {
    "riskLevel": "Moderate",
    "confidence": 0.82,
    "createdAt": "2026-06-09T10:45:00.000Z"
  }
}
```

Admin audit-style events include request metadata when available:

```json
{
  "eventType": "user.role_changed",
  "entityId": "665f1d6b6e6a9f2b7b1c5678",
  "userId": "665f1d6b6e6a9f2b7b1c9999",
  "role": "admin",
  "timestamp": "2026-06-09T11:00:00.000Z",
  "payload": {
    "entity": "user",
    "targetUserId": "665f1d6b6e6a9f2b7b1c5678",
    "previousRole": "patient",
    "newRole": "doctor",
    "ipAddress": "127.0.0.1",
    "userAgent": "Mozilla/5.0"
  }
}
```

### Troubleshooting

- Redis will not connect: confirm Docker is running, then run
  `docker compose ps redis` from the project root and check `REDIS_URL`.
- Reminder or notification requests return `503`: Redis is unavailable or BullMQ
  cannot write to Redis. Start Redis and retry the request.
- Cache-backed endpoints are slow but still work: Redis cache reads/writes are
  failing open. Check backend logs for `Cache read failed` or `Cache write failed`.
- Kafka events are missing: run `docker compose ps kafka zookeeper`, then
  `npm run kafka:init` from `backend/`.
- API requests still succeed while Kafka is down: this is expected. Kafka emits
  are fire-and-forget and log `Kafka event emit failed`.
- Consumers exit on startup: Kafka or MongoDB is unavailable, topics may not be
  initialized, or `KAFKA_BROKERS` points to the wrong broker.
- Workers exit on startup: MongoDB or Redis is unavailable. Start infrastructure
  before workers.
- Local Kafka listeners: the compose file advertises `localhost:9092`, so backend
  scripts should be run on the host machine, not from another container.

## Production Readiness

Before deploying, set production-safe values:

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_ACCESS_SECRET=<32+ character random secret>
JWT_REFRESH_SECRET=<different 32+ character random secret>
CLIENT_URL=https://app.example.com
CLIENT_URLS=https://app.example.com,https://admin.example.com
TRUST_PROXY=1
REDIS_URL=rediss://...
KAFKA_BROKERS=broker-1:9092,broker-2:9092
```

Production safeguards currently in place:

- Startup validates required environment variables and rejects placeholder JWT secrets.
- MongoDB startup fails fast instead of silently continuing after connection errors.
- Refresh tokens are hashed before being stored in `Session` documents.
- Express disables `x-powered-by`, adds request IDs, uses Helmet, enforces JSON body limits, and hides internal 500-level error messages in production.
- `/health` reports liveness, while `/readyz` reports MongoDB and Redis readiness.
- Kafka emits are non-blocking for API requests and log warnings when brokers are unavailable.
- Redis cache failures fail open with logs; BullMQ queue scheduling failures return `503` because work could not be safely queued.
- Server shutdown closes Kafka producer, BullMQ queues, Redis, rate-limit stores, and MongoDB-backed processes.
- Workers and Kafka consumers validate env on startup and close their connections on `SIGINT`/`SIGTERM`.
- Docker Compose infrastructure services have healthchecks, restart policies, and bounded log files.

Recommended production process model:

```bash
npm run start
npm run worker:reminders
npm run worker:notifications
npm run consumer:audit
npm run consumer:analytics
```

Run each command as a separately supervised process, for example with your cloud
platform process manager, Kubernetes Deployments, systemd, or PM2. Do not start
workers or consumers from `server.js`; they are intentionally separate so API
traffic and background work can scale independently.

Operational checklist:

- Run `npm ci --omit=dev` for backend production installs.
- Run `npm run kafka:init` during deployment after Kafka is reachable.
- Verify `/readyz` returns `200` before routing traffic.
- Store uploaded report files on durable storage or mount `backend/uploads` to a persistent volume.
- Keep MongoDB, Redis, and Kafka outside this local compose file for real production unless the environment is intentionally single-host.
- Enable provider-level TLS, backups, metrics, and alerts for MongoDB, Redis, Kafka, API, workers, and consumers.
- Keep `ALLOW_ADMIN_SEED_TOOLS=false` in production unless a controlled maintenance window requires it.

## Auth Flow

- `POST /api/auth/register` and `POST /api/auth/login` return a user, access token, and refresh token.
- Protected routes require `Authorization: Bearer <accessToken>`.
- The frontend refreshes access tokens through `POST /api/auth/refresh`.
- Logout calls `POST /api/auth/logout` and clears client auth state.

## Routes

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/health-logs`
- `GET /api/health-logs`
- `GET /api/health-logs/:id`
- `PATCH /api/health-logs/:id`
- `DELETE /api/health-logs/:id`
- `POST /api/cycles`
- `GET /api/cycles`
- `GET /api/cycles/analytics`
- `GET /api/cycles/:id`
- `PATCH /api/cycles/:id`
- `DELETE /api/cycles/:id`
- `POST /api/reminders`
- `GET /api/reminders`
- `PATCH /api/reminders/:id`
- `PATCH /api/reminders/:id/complete`
- `DELETE /api/reminders/:id`
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`
- `PATCH /api/notifications/read-all`
- `DELETE /api/notifications/:id`
- `GET /api/doctors`
- `GET /api/doctors/:id`
- `POST /api/doctors`
- `PATCH /api/doctors/:id`
- `DELETE /api/doctors/:id`
- `POST /api/appointments`
- `GET /api/appointments/my`
- `GET /api/appointments/:id`
- `PATCH /api/appointments/:id/status`
- `DELETE /api/appointments/:id`
- `POST /api/reports/upload`
- `GET /api/reports`
- `GET /api/reports/:id`
- `DELETE /api/reports/:id`
- `POST /api/pcos/predict`
- `GET /api/pcos/history`
- `GET /api/pcos/:id`
- `GET /api/analytics/summary`
- `GET /api/timeline`
- `GET /api/articles`
- `GET /api/articles/:slug`
- `GET /api/articles/search/suggestions`
- `GET /api/articles/:slug/similar`
- `GET /api/admin/health`
- `GET /api/admin/analytics/overview`
- `GET /api/admin/audit-logs`
- `GET /api/admin/doctors`
- `POST /api/admin/doctors`
- `GET /api/admin/doctors/:id`
- `PATCH /api/admin/doctors/:id`
- `DELETE /api/admin/doctors/:id`
- `PATCH /api/admin/doctors/:id/verify`
- `PATCH /api/admin/doctors/:id/unverify`
- `GET /api/admin/doctors/:id/appointments`
- `GET /api/admin/articles`
- `POST /api/admin/articles`
- `GET /api/admin/articles/:id`
- `PATCH /api/admin/articles/:id`
- `DELETE /api/admin/articles/:id`
- `PATCH /api/admin/articles/:id/publish`
- `PATCH /api/admin/articles/:id/unpublish`
- `PATCH /api/admin/articles/:id/feature`
- `PATCH /api/admin/articles/:id/unfeature`
- `POST /api/admin/articles/refresh-search`
- `POST /api/admin/articles/export-csv`
- `POST /api/admin/articles/retrain-recommender`
- `GET /api/admin/users`
- `GET /api/admin/users/:id`
- `PATCH /api/admin/users/:id/role`
- `PATCH /api/admin/users/:id/activate`
- `PATCH /api/admin/users/:id/deactivate`
- `GET /api/admin/users/:id/sessions`
- `PATCH /api/admin/users/:id/revoke-sessions`
- `DELETE /api/admin/users/:id`
- `GET /api/admin/appointments`
- `PATCH /api/admin/appointments/:id/status`
- `PATCH /api/admin/appointments/:id/resolve`
- `GET /api/admin/reports`
- `GET /api/admin/reports/:id`
- `DELETE /api/admin/reports/:id`
- `POST /api/admin/notifications/announcement`
- `POST /api/admin/notifications/system`
- `GET /api/admin/notifications`
- `GET /api/admin/tools/status`
- `POST /api/admin/tools/seed-doctors`
- `POST /api/admin/tools/seed-articles`
- `POST /api/admin/tools/export-articles-csv`
- `POST /api/admin/tools/refresh-article-trie`
- `POST /api/admin/tools/retrain-article-recommender`

## Admin Access

Register a normal user first, then promote the account in MongoDB:

```js
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin", isActive: true } }
)
```

All `/api/admin/*` routes require a valid access token and `role: "admin"`.

## Admin Tools

- Seed doctors: runs the shared doctor seed function without disconnecting the live backend.
- Seed articles: runs the shared article seed function and refreshes Knowledge Hub Trie search.
- Export article CSV: writes published articles to `ml-model/article-service/data/articles.csv`.
- Refresh article Trie: rebuilds backend autocomplete suggestions.
- Retrain article recommender: calls `ARTICLE_ML_SERVICE_URL/retrain-recommender` when available and otherwise returns a clear manual training message.
- Status: reports MongoDB connection state, article/doctor counts, configured ML URLs, and article-service health.

Seed tools are disabled when `NODE_ENV=production` unless
`ALLOW_ADMIN_SEED_TOOLS=true` is set. Admin tool write routes also have a
lightweight per-admin rate limit.

## Admin Audit Logs

Successful admin write actions are recorded in `AuditLog` and can be reviewed
through `GET /api/admin/audit-logs`. Supported filters are `action`, `entity`,
`user`, `startDate`, `endDate`, `page`, and `limit`.

## Upload Notes

- Medical report upload field name: `file`
- Storage directory: `backend/uploads/reports`
- Allowed files: PDF, JPG, PNG
- Max size: 5MB
- Deleting a report removes both the MongoDB record and local file when present.
