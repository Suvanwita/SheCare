# SheCare

SheCare is a full-stack women's health platform with a Next.js dashboard, Express/MongoDB API, and FastAPI ML services. The app supports authentication, cycles, health logs, reminders, notifications, doctors, appointments, reports, analytics, Knowledge Hub articles, PCOS risk assessment, and admin operations.

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS, Zustand, Axios, React Hook Form, Zod, Recharts
- Backend: Node.js, Express, MongoDB, Mongoose, JWT auth, Multer local uploads
- ML: FastAPI PCOS, cycle, and article recommendation services
- Database: MongoDB

## Folder Structure

```text
SheCare/
├── backend/          # Express API, Mongo models, controllers, routes, uploads
├── frontend/         # Next.js app and dashboard pages
├── ml-model/         # FastAPI ML services
└── README.md
```

## Setup

1. Start MongoDB locally.

2. Start the PCOS ML service:

```bash
cd ml-model/pcos-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

3. Start the article recommendation service:

```bash
cd ml-model/article-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8002
```

4. Start the backend:

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

5. Seed doctors and articles:

```bash
cd backend
npm run seed:doctors
node scripts/seedArticles.js
```

6. Start the frontend:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Local URLs

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Backend health: `http://localhost:5000/health`
- PCOS ML service: `http://localhost:8000`
- Article ML service: `http://localhost:8002`

## Required Env

Backend `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/shecare
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:3000
ML_SERVICE_URL=http://localhost:8000
ARTICLE_ML_SERVICE_URL=http://localhost:8002
ALLOW_ADMIN_SEED_TOOLS=false
```

Frontend `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

ML `ml-model/.env`:

```env
PORT=8000
```

## Main Backend Routes

- `GET /health`
- `/api/auth/*`
- `/api/health-logs/*`
- `/api/cycles/*`
- `/api/reminders/*`
- `/api/notifications/*`
- `/api/doctors/*`
- `/api/appointments/*`
- `/api/reports/*`
- `/api/pcos/*`
- `/api/articles/*`
- `GET /api/analytics/summary`
- `/api/admin/*`

Protected API calls use `Authorization: Bearer <accessToken>`.

## Admin Module

Create an admin by registering normally, then promoting that account in MongoDB:

```js
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin", isActive: true } }
)
```

Admin UI routes live under `/admin` and are separated from the user dashboard. Non-authenticated users are redirected to `/login`; authenticated non-admin users are redirected to `/dashboard`.

Admin API route groups:

- `GET /api/admin/health`
- `/api/admin/doctors/*`
- `/api/admin/articles/*`
- `/api/admin/users/*`
- `/api/admin/appointments/*`
- `/api/admin/reports/*`
- `/api/admin/notifications/*`
- `GET /api/admin/analytics/overview`
- `/api/admin/tools/*`
- `GET /api/admin/audit-logs`

Admin Tools:

- `POST /api/admin/tools/seed-doctors`: load the curated sample doctors.
- `POST /api/admin/tools/seed-articles`: load Knowledge Hub sample articles and rebuild autocomplete.
- `POST /api/admin/tools/export-articles-csv`: export published articles to `ml-model/article-service/data/articles.csv`.
- `POST /api/admin/tools/refresh-article-trie`: rebuild backend Trie suggestions.
- `POST /api/admin/tools/retrain-article-recommender`: call article-service retraining if available.
- `GET /api/admin/tools/status`: check MongoDB counts and ML service health/configuration.

Admin seed tools are blocked when `NODE_ENV=production` unless
`ALLOW_ADMIN_SEED_TOOLS=true` is set deliberately. Admin tool write endpoints
also have a lightweight per-admin rate limit.

Audit Logs:

- `GET /api/admin/audit-logs`: read successful admin write actions with filters
  for action, entity, user id, and date range.

The article-service exposes `POST /retrain-recommender`; Admin Tools uses it
after exporting `articles.csv` so TF-IDF recommendations can reload without a
service restart.

Backend admin security tests can be run with:

```bash
cd backend
npm test
```
