# SheCare Backend

Express and MongoDB API for SheCare.

## Env Variables

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/shecare
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:3000
ML_SERVICE_URL=http://localhost:8000
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
npm run seed:doctors
```

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

## Upload Notes

- Medical report upload field name: `file`
- Storage directory: `backend/uploads/reports`
- Allowed files: PDF, JPG, PNG
- Max size: 5MB
- Deleting a report removes both the MongoDB record and local file when present.
