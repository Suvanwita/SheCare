# SheCare

SheCare is a full-stack women's health platform with a Next.js dashboard, Express/MongoDB API, and a FastAPI PCOS prediction service. The app supports authentication, cycles, health logs, reminders, notifications, doctors, appointments, reports, analytics, and PCOS risk assessment.

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS, Zustand, Axios, React Hook Form, Zod, Recharts
- Backend: Node.js, Express, MongoDB, Mongoose, JWT auth, Multer local uploads
- ML: FastAPI PCOS prediction service
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

3. Start the backend:

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

4. Seed doctors:

```bash
cd backend
npm run seed:doctors
```

5. Start the frontend:

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

## Required Env

Backend `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/shecare
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:3000
ML_SERVICE_URL=http://localhost:8000
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
- `GET /api/analytics/summary`

Protected API calls use `Authorization: Bearer <accessToken>`.
