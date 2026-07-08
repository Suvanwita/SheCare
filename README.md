# SheCare

SheCare is a full-stack women's health platform for cycle tracking, health logging, reminders, appointments, medical reports, educational content, analytics, and admin operations. It combines a Next.js dashboard, an Express/MongoDB backend, Redis/BullMQ background jobs, Kafka event streaming, and FastAPI ML services for PCOS, cycle, and article intelligence.

The project is designed as a practical care workspace: users can record health activity, review trends, receive reminders and notifications, book doctors, organize reports, read Knowledge Hub content, and view a unified Health Activity Timeline. Admins can manage doctors, users, articles, announcements, reports, operational tools, analytics, and audit logs.

## Project Utility

SheCare helps users and care teams bring scattered health actions into one workflow:

- Users get one dashboard for cycles, symptoms, reports, appointments, reminders, PCOS assessment history, article education, and timeline activity.
- Doctors and admins can keep operational records organized through role-based admin tools.
- Redis-backed caching makes read-heavy content and doctor lists faster.
- BullMQ workers move reminder and notification work out of API requests.
- Kafka events create a durable stream for audit and analytics consumers.
- AnalyticsEvent records power the user Health Activity Timeline and future reporting surfaces.
- ML services provide risk and recommendation support while keeping the core backend as the system of record.

## Features

### User Experience

- Authentication with register, login, refresh, logout, and protected dashboard access.
- Role-aware routing for user and admin workspaces.
- Dashboard overview for health activity and quick navigation.
- Cycle tracker for cycle dates, predicted periods, fertility windows, and cycle insights.
- Health logs for symptoms, mood, sleep, hydration, pain, stress, notes, and daily wellness context.
- Reminders for medicine, cycle, appointment, and custom care tasks.
- Notification center for reminder alerts, targeted messages, and admin announcements.
- Doctor directory with filters and profile detail.
- Appointment booking, appointment history, status updates, and cancellation flow.
- Medical report upload and management for PDF, JPG, and PNG files.
- PCOS risk assessment flow backed by the PCOS ML service.
- Analytics dashboard for cycle, symptom, hydration, sleep, stress, reminder, and PCOS summaries.
- Health Activity Timeline at `/dashboard/timeline`, backed by Kafka analytics events.
- Knowledge Hub article listing, article detail, search suggestions, and similar article recommendations.

### Admin Experience

- Admin dashboard with operational summaries.
- User management, role changes, activation/deactivation, session inspection, and session revocation.
- Doctor CRUD, verification, availability, and appointment views.
- Article CRUD, publish/unpublish, feature/unfeature, CSV export, Trie refresh, and recommender retraining.
- Appointment administration and resolution workflows.
- Report review and deletion.
- Global and targeted announcement jobs through the notification queue.
- Admin analytics overview with Redis caching.
- Admin tool status checks for MongoDB counts and ML service configuration.
- Audit log review for successful admin write actions.

### Infrastructure And Background Work

- Redis for cache, rate-limit storage, and BullMQ queue storage.
- BullMQ queues:
  - `reminderQueue`
  - `notificationQueue`
  - `emailQueue`
  - `analyticsQueue`
- Reminder worker processes due reminders and enqueues notification jobs.
- Notification worker creates individual, targeted, and global notifications.
- Kafka topics for domain events:
  - `user.events`
  - `appointment.events`
  - `reminder.events`
  - `report.events`
  - `pcos.events`
  - `article.events`
  - `admin.events`
  - `audit.events`
  - `analytics.events`
- Kafka audit consumer persists admin/audit activity into `AuditLog`.
- Kafka analytics consumer persists normalized domain activity into `AnalyticsEvent`.
- API requests continue when Kafka is unavailable; Kafka emits are fail-open with warnings.
- Queue-backed features return clear Redis/BullMQ errors when jobs cannot be scheduled.

### Production-Oriented Safeguards

- Environment validation on API, worker, consumer, and Kafka topic initialization startup.
- MongoDB startup fails fast if the database is unavailable.
- Refresh tokens are hashed before being stored.
- Request IDs are attached to backend responses.
- Internal 500-level messages are hidden in production.
- Helmet security headers and JSON body limits.
- Frontend security headers through Next.js config.
- `/health` liveness route and `/readyz` readiness route.
- Graceful shutdown for API, Redis, Kafka producer, BullMQ queues, workers, consumers, and MongoDB.
- Docker Compose healthchecks, restart policies, and bounded logs for Redis, Zookeeper, and Kafka.

## Tech Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Zustand
- Axios
- React Hook Form
- Zod
- Recharts
- Lucide React

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT authentication
- Cookie parser
- Helmet
- CORS
- Morgan
- Multer
- ioredis
- BullMQ
- express-rate-limit
- rate-limit-redis
- KafkaJS
- Node test runner

### Machine Learning Services

- FastAPI
- Uvicorn
- Python ML service modules
- PCOS risk prediction service
- Cycle irregularity prediction service
- Article recommendation service

### Infrastructure

- MongoDB
- Redis
- Apache Kafka
- Zookeeper
- Docker Compose

## Folder Structure

```text
SheCare/
├── backend/                # Express API, controllers, models, queues, Kafka, workers, consumers
├── frontend/               # Next.js app, dashboard, admin UI, services, stores, components
├── ml-model/               # FastAPI ML services for PCOS, cycle, and articles
├── docker-compose.yml      # Local Redis, Zookeeper, Kafka
└── README.md               # Full project guide
```

## Architecture Overview

```text
Browser / Next.js Frontend
  |
  | HTTP + Bearer token
  v
Express Backend API
  |
  |-- MongoDB
  |     |-- Users, sessions, cycles, logs, reminders, reports
  |     |-- appointments, doctors, articles, notifications
  |     |-- AuditLog, AnalyticsEvent
  |
  |-- Redis
  |     |-- API cache
  |     |-- rate-limit counters
  |     |-- BullMQ queue storage
  |
  |-- BullMQ
  |     |-- reminderQueue -> reminder worker
  |     |-- notificationQueue -> notification worker
  |
  |-- Kafka Producer
  |     |-- user.events, appointment.events, reminder.events
  |     |-- report.events, pcos.events, article.events
  |     |-- admin.events, audit.events
  |
  |-- Kafka Consumers
  |     |-- audit consumer -> AuditLog
  |     |-- analytics consumer -> AnalyticsEvent -> /api/timeline
  |
  |-- FastAPI ML Services
        |-- PCOS service on :8000
        |-- Cycle service on :8001
        |-- Article service on :8002
```

## Main Application Routes

### Frontend

- `/` landing page
- `/login`
- `/register`
- `/dashboard`
- `/dashboard/cycle`
- `/dashboard/health-logs`
- `/dashboard/knowledge`
- `/dashboard/knowledge/[slug]`
- `/dashboard/reminders`
- `/dashboard/appointments`
- `/dashboard/reports`
- `/dashboard/analytics`
- `/dashboard/timeline`
- `/dashboard/pcos-risk`
- `/admin`
- `/admin/analytics`
- `/admin/appointments`
- `/admin/articles`
- `/admin/audit-logs`
- `/admin/doctors`
- `/admin/notifications`
- `/admin/reports`
- `/admin/tools`
- `/admin/users`

### Backend

- `GET /health`
- `GET /readyz`
- `/api/auth/*`
- `/api/cycles/*`
- `/api/health-logs/*`
- `/api/reminders/*`
- `/api/notifications/*`
- `/api/doctors/*`
- `/api/appointments/*`
- `/api/reports/*`
- `/api/pcos/*`
- `/api/analytics/*`
- `/api/timeline`
- `/api/articles/*`
- `/api/admin/*`

Protected API calls use:

```text
Authorization: Bearer <accessToken>
```

## Prerequisites

- Node.js 20 or newer
- npm
- Python 3.10 or newer
- MongoDB running locally or a MongoDB connection string
- Docker and Docker Compose for Redis/Kafka/Zookeeper

## Setup And Installation

### Quick Start (All-in-One script)

You can run the entire platform (infrastructure, frontend, backend API, workers, consumers, and ML services) with a single command from the project root:

```bash
# Make sure docker daemon is running
./start.sh
```

Or using `npm`:

```bash
npm start
```

This script will:
- Spin up Redis, Zookeeper, and Kafka in Docker Compose automatically.
- Wait for the services to be ready and initialize the Kafka topics.
- Start all 3 FastAPI ML services, backend API, 2 backend workers, 2 backend consumers, and the Next.js frontend in development mode.
- Output clean, colored, prefixed logs for each service.
- Gracefully shut down all background services when you press `Ctrl+C`.

---

### Step-by-Step Setup

### 1. Clone And Enter The Project

```bash
git clone <repo-url>
cd SheCare
```

### 2. Start Infrastructure

Start Redis, Zookeeper, and Kafka from the project root:

```bash
docker compose up -d redis zookeeper kafka
```

Check the containers:

```bash
docker compose ps
```

### 3. Configure Backend Environment

Create `backend/.env`:

```bash
cd backend
cp .env.example .env
```

For local development, make sure these values are present:

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
REDIS_URL=redis://localhost:6379
KAFKA_CLIENT_ID=shecare-backend
KAFKA_BROKERS=localhost:9092
```

Install backend dependencies:

```bash
npm install
```

Initialize Kafka topics:

```bash
npm run kafka:init
```

Start the backend API:

```bash
npm run dev
```

Backend runs at:

```text
http://localhost:5000
```

### 4. Configure Frontend Environment

Create `frontend/.env.local`:

```bash
cd ../frontend
```

Add:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Install frontend dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:3000
```

### 5. Start ML Services

Start the PCOS service:

```bash
cd ../ml-model/pcos-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Start the cycle service:

```bash
cd ../cycle-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

Start the article recommendation service:

```bash
cd ../article-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8002
```

### 6. Start Workers And Consumers

Run these from `backend/` in separate terminals:

```bash
npm run worker:reminders
npm run worker:notifications
npm run consumer:audit
npm run consumer:analytics
```

### 7. Seed Local Data

Run from `backend/`:

```bash
npm run seed:doctors
npm run seed:articles
```

## Local URLs

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- Backend liveness: `http://localhost:5000/health`
- Backend readiness: `http://localhost:5000/readyz`
- Redis: `redis://localhost:6379`
- Kafka: `localhost:9092`
- PCOS ML service: `http://localhost:8000`
- Cycle ML service: `http://localhost:8001`
- Article ML service: `http://localhost:8002`

## Useful Commands

### Backend

```bash
cd backend
npm run dev
npm test
npm run kafka:init
npm run worker:reminders
npm run worker:notifications
npm run consumer:audit
npm run consumer:analytics
npm run seed:doctors
npm run seed:articles
```

### Frontend

```bash
cd frontend
npm run dev
npm run build
npm run lint
```

### Infrastructure

```bash
docker compose up -d redis zookeeper kafka
docker compose ps
docker compose logs kafka
docker compose down
```

## Admin Access

Register a normal account first, then promote it in MongoDB:

```js
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin", isActive: true } }
)
```

Admin routes require a valid access token and `role: "admin"`.

Production note: admin seed tools are disabled when `NODE_ENV=production` unless `ALLOW_ADMIN_SEED_TOOLS=true` is deliberately set.

## Kafka Event Examples

Example appointment event:

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

Example PCOS analytics event:

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

## Production Checklist

- Set `NODE_ENV=production`.
- Use strong, different JWT secrets of at least 32 characters.
- Use production MongoDB, Redis, and Kafka services with backups and monitoring.
- Set `CLIENT_URL` and `CLIENT_URLS` to trusted frontend origins.
- Set `TRUST_PROXY=1` behind a reverse proxy or cloud load balancer.
- Serve frontend and backend over HTTPS.
- Run API, reminder worker, notification worker, audit consumer, and analytics consumer as separately supervised processes.
- Run `npm run kafka:init` after Kafka is reachable during deployment.
- Verify `/readyz` before routing traffic.
- Use durable storage for uploaded reports or mount `backend/uploads` to persistent storage.
- Keep `ALLOW_ADMIN_SEED_TOOLS=false` unless a controlled maintenance window requires it.

## Troubleshooting

- Backend fails on startup: check `backend/.env`, MongoDB availability, Redis availability, and required JWT secrets.
- `/readyz` returns `503`: MongoDB or Redis is not ready.
- Reminder or notification requests return `503`: Redis/BullMQ cannot enqueue jobs.
- Kafka events do not appear in audit or analytics: run `docker compose ps kafka zookeeper`, then `npm run kafka:init`.
- API requests still work while Kafka is down: expected behavior; Kafka emits are non-blocking and log warnings.
- Timeline is empty: start `npm run consumer:analytics` and generate events such as appointment booking, report upload, reminder completion, PCOS assessment, or article view.
- Similar articles are missing: start the article ML service on port `8002`; the backend has fallback recommendations for some cases.

## Verification

Run backend tests:

```bash
cd backend
npm test
```

Run frontend production build:

```bash
cd frontend
npm run build
```

Validate Docker Compose:

```bash
docker compose config --quiet
```
