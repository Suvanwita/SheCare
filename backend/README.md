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
ARTICLE_ML_SERVICE_URL=http://localhost:8002
ALLOW_ADMIN_SEED_TOOLS=false
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
