# SheCare API Contract

Base URL for local backend requests:

```text
http://localhost:5000
```

Frontend API base URL:

```text
http://localhost:5000/api
```

## Response Envelope

Successful backend responses use a consistent envelope:

```json
{
  "success": true,
  "message": "Human readable status message",
  "data": {}
}
```

Error responses are normalized by the backend error middleware. Typical shape:

```json
{
  "success": false,
  "message": "Error message"
}
```

Rate-limit errors include limit metadata:

```json
{
  "success": false,
  "message": "Too many API requests. Please try again later.",
  "data": {
    "limit": 300,
    "windowMs": 900000
  }
}
```

## Authentication

Protected endpoints require:

```http
Authorization: Bearer <accessToken>
```

The frontend also sends credentials for refresh-token cookies:

```ts
withCredentials: true
```

Access tokens expire by `ACCESS_TOKEN_EXPIRES_IN`, default `15m`. Refresh tokens expire by `REFRESH_TOKEN_EXPIRES_IN`, default `7d`.

## Common Error Cases

| Status | Meaning | Common causes |
| ---: | --- | --- |
| `400` | Bad request | Missing required fields, invalid dates, unsupported file type |
| `401` | Unauthorized | Missing, expired, or invalid access/refresh token |
| `403` | Forbidden | Inactive account, non-admin user accessing admin route |
| `404` | Not found | Resource ID does not exist or does not belong to current user |
| `409` | Conflict | Duplicate email or conflicting business state |
| `429` | Too many requests | Auth/API/ML/admin-tool rate limit exceeded |
| `500` | Server error | Unexpected backend failure |
| `503` | Service unavailable | Redis queue unavailable or ML service unavailable |

## Public Health Endpoints

| Method | Endpoint | Auth | Request | Success response | Error cases |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/health` | Public | None | Backend liveness, timestamp, environment | `500` unexpected |
| `GET` | `/readyz` | Public | None | Mongo/Redis readiness checks | `503` when MongoDB or Redis is not ready |

## Auth API

| Method | Endpoint | Auth | Request body | Success response | Error cases |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | `{ fullName, email, password, role? }` | `201`, `{ user, accessToken, refreshToken }`; also sets `refreshToken` cookie | `400` missing fields/invalid role, `409` email exists, `429` auth rate limit |
| `POST` | `/api/auth/login` | Public | `{ email, password }` | `200`, `{ user, accessToken, refreshToken }`; also sets `refreshToken` cookie | `400` missing fields, `401` invalid credentials, `403` inactive account, `429` auth rate limit |
| `POST` | `/api/auth/refresh` | Public | `{ refreshToken? }`; cookie fallback supported | `200`, `{ accessToken }` | `400` missing refresh token, `401` invalid/revoked/expired session |
| `POST` | `/api/auth/logout` | Public | `{ refreshToken? }`; cookie fallback supported | `200`, no data required | `429` auth rate limit |
| `GET` | `/api/auth/me` | Bearer token | None | `200`, `{ user }` | `401` missing/invalid token |

## Cycle API

All cycle endpoints require a bearer token.

| Method | Endpoint | Request body / query | Success response | Error cases |
| --- | --- | --- | --- | --- |
| `POST` | `/api/cycles` | `{ startDate, endDate?, flowIntensity?, symptoms?, notes? }` | `201`, `{ cycle }` with calculated `cycleLength` and `periodDuration` | `400` missing/invalid dates, `401` |
| `GET` | `/api/cycles` | Query: `page?`, `limit?` | `200`, `{ cycles, pagination }` | `401` |
| `GET` | `/api/cycles/analytics` | None | `200`, average cycle length, period duration, irregular count, next period, trend | `401` |
| `GET` | `/api/cycles/:id` | Path `id` | `200`, `{ cycle }` | `401`, `404` invalid/not owned |
| `PATCH` | `/api/cycles/:id` | Partial cycle fields | `200`, `{ cycle }` | `400` invalid dates, `401`, `404` |
| `DELETE` | `/api/cycles/:id` | Path `id` | `200`, deleted ID/status | `401`, `404` |

## Health Log API

All health-log endpoints require a bearer token.

| Method | Endpoint | Request body / query | Success response | Error cases |
| --- | --- | --- | --- | --- |
| `POST` | `/api/health-logs` | `{ date, mood?, symptoms?, sleepHours?, waterIntake?, weightKg?, painLevel?, stressLevel?, notes? }` | `201`, `{ healthLog }` | `400` invalid payload, `401` |
| `GET` | `/api/health-logs` | Query: `page?`, `limit?`, date filters where supported | `200`, `{ healthLogs, pagination }` | `401` |
| `GET` | `/api/health-logs/:id` | Path `id` | `200`, `{ healthLog }` | `401`, `404` |
| `PATCH` | `/api/health-logs/:id` | Partial health log fields | `200`, `{ healthLog }` | `400`, `401`, `404` |
| `DELETE` | `/api/health-logs/:id` | Path `id` | `200`, deleted ID/status | `401`, `404` |

## Reminder API

All reminder endpoints require a bearer token. Reminder creation/update also schedules or reschedules BullMQ jobs.

| Method | Endpoint | Request body / query | Success response | Error cases |
| --- | --- | --- | --- | --- |
| `POST` | `/api/reminders` | `{ title, type, message?, scheduledAt, repeat?, priority? }` | `201`, `{ reminder }` | `400`, `401`, `503` queue scheduling unavailable |
| `GET` | `/api/reminders` | Query filters/pagination where supported | `200`, reminders list | `401` |
| `PATCH` | `/api/reminders/:id` | Partial reminder fields | `200`, `{ reminder }` | `400`, `401`, `404`, `503` queue rescheduling unavailable |
| `PATCH` | `/api/reminders/:id/complete` | None or completion payload | `200`, `{ reminder }` | `401`, `404` |
| `DELETE` | `/api/reminders/:id` | Path `id` | `200`, deleted ID/status | `401`, `404`, `503` queue cancellation unavailable |

## Notification API

All notification endpoints require a bearer token.

| Method | Endpoint | Request | Success response | Error cases |
| --- | --- | --- | --- | --- |
| `GET` | `/api/notifications` | Query filters/pagination where supported | `200`, notifications list | `401` |
| `PATCH` | `/api/notifications/read-all` | None | `200`, updated count/status | `401` |
| `PATCH` | `/api/notifications/:id/read` | Path `id` | `200`, `{ notification }` | `401`, `404` |
| `DELETE` | `/api/notifications/:id` | Path `id` | `200`, deleted ID/status | `401`, `404` |

## Doctor API

| Method | Endpoint | Auth | Request body / query | Success response | Error cases |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/api/doctors` | Public | Query: filters such as specialization/location/search where supported | `200`, doctors list | `500` unexpected |
| `GET` | `/api/doctors/:id` | Public | Path `id` | `200`, `{ doctor }` | `404` |
| `POST` | `/api/doctors` | Bearer token | `{ name, specialization, experienceYears?, rating?, location?, consultationFee?, availableSlots?, bio? }` | `201`, `{ doctor }` | `400`, `401` |
| `PATCH` | `/api/doctors/:id` | Bearer token | Partial doctor fields | `200`, `{ doctor }` | `400`, `401`, `404` |
| `DELETE` | `/api/doctors/:id` | Bearer token | Path `id` | `200`, deleted ID/status | `401`, `404` |

## Appointment API

All appointment endpoints require a bearer token.

| Method | Endpoint | Request body / query | Success response | Error cases |
| --- | --- | --- | --- | --- |
| `POST` | `/api/appointments` | `{ doctor, date, slot, appointmentType, reason?, notes? }` | `201`, `{ appointment }`; may emit appointment event/notification | `400`, `401`, `404` doctor not found |
| `GET` | `/api/appointments/my` | Query filters/pagination where supported | `200`, current user's appointments | `401` |
| `GET` | `/api/appointments/:id` | Path `id` | `200`, `{ appointment }` | `401`, `404` |
| `PATCH` | `/api/appointments/:id/status` | `{ status }` where status is `pending`, `confirmed`, `completed`, or `cancelled` | `200`, `{ appointment }` | `400`, `401`, `404` |
| `DELETE` | `/api/appointments/:id` | Path `id` | `200`, deleted/cancelled status | `401`, `404` |

## Report API

All report endpoints require a bearer token.

| Method | Endpoint | Request | Success response | Error cases |
| --- | --- | --- | --- | --- |
| `POST` | `/api/reports/upload` | `multipart/form-data` with `file`; metadata fields such as `title`, `category`, `doctorName`, `notes` | `201`, `{ report }` | `400` unsupported file/missing file, `401`, `413` or multer file-size error over 5 MB |
| `GET` | `/api/reports` | Query filters/pagination where supported | `200`, reports list | `401` |
| `GET` | `/api/reports/:id` | Path `id` | `200`, `{ report }` | `401`, `404` |
| `DELETE` | `/api/reports/:id` | Path `id` | `200`, deleted ID/status | `401`, `404` |

Supported report files:

- MIME types: `application/pdf`, `image/jpeg`, `image/png`
- Extensions: `.pdf`, `.jpg`, `.jpeg`, `.png`
- Maximum size: `5 MB`

## PCOS API

All PCOS endpoints require a bearer token.

| Method | Endpoint | Request body / query | Success response | Error cases |
| --- | --- | --- | --- | --- |
| `POST` | `/api/pcos/predict` | PCOS assessment fields, including clinical and symptom values expected by the PCOS ML model | `201`, `{ assessment }` containing `input` and ML `result` | `400` invalid payload, `401`, `429` ML rate limit, `503` ML service unavailable |
| `GET` | `/api/pcos/history` | Query: `page?`, `limit?` | `200`, `{ assessments, pagination }` | `401` |
| `GET` | `/api/pcos/:id` | Path `id` | `200`, `{ assessment }` | `401`, `404` |

## Analytics And Timeline API

| Method | Endpoint | Auth | Request | Success response | Error cases |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/api/analytics/summary` | Bearer token | None | `200`, health/cycle/reminder/appointment/PCOS analytics summary | `401` |
| `GET` | `/api/timeline` | Bearer token | Query filters/pagination where supported | `200`, timeline items built from `AnalyticsEvent` | `401` |

## Article API

| Method | Endpoint | Auth | Request body / query | Success response | Error cases |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/api/articles/search/suggestions` | Public | Query search term | `200`, suggestions | `500` unexpected |
| `GET` | `/api/articles` | Public | Query: category/search/featured/pagination where supported | `200`, article list | `500` unexpected |
| `POST` | `/api/articles` | Bearer token | `{ title, slug, category, summary, content, coverImage?, tags?, keywords?, readingTime?, author?, featured?, isPublished? }` | `201`, `{ article }` | `400`, `401`, `409` duplicate slug |
| `GET` | `/api/articles/:slug/similar` | Public, ML rate limited | Path `slug` | `200`, similar articles | `404`, `429`, article ML fallback/unavailable behavior |
| `GET` | `/api/articles/:slug` | Public | Path `slug` | `200`, `{ article }`; increments views | `404` |
| `PATCH` | `/api/articles/:slug` | Bearer token | Partial article fields | `200`, `{ article }` | `400`, `401`, `404` |
| `DELETE` | `/api/articles/:slug` | Bearer token | Path `slug` | `200`, deleted status | `401`, `404` |

## Admin API

All admin endpoints require:

1. Bearer access token.
2. Active user account.
3. `role === "admin"`.

Admin write methods also produce an audit log and Kafka audit event after successful responses.

### Admin Overview And Tools

| Method | Endpoint | Request | Success response | Error cases |
| --- | --- | --- | --- | --- |
| `GET` | `/api/admin/health` | None | Admin health/status summary | `401`, `403` |
| `GET` | `/api/admin/analytics/overview` | None | Operational analytics overview | `401`, `403` |
| `GET` | `/api/admin/audit-logs` | Query filters/pagination | Audit logs | `401`, `403` |
| `GET` | `/api/admin/tools/status` | None | Tool/service status, counts, ML config | `401`, `403` |
| `POST` | `/api/admin/tools/seed-doctors` | None/options | Seed result | `401`, `403`, `429` admin tool limit |
| `POST` | `/api/admin/tools/seed-articles` | None/options | Seed result | `401`, `403`, `429` |
| `POST` | `/api/admin/tools/export-articles-csv` | None/options | CSV/export result | `401`, `403`, `429` |
| `POST` | `/api/admin/tools/refresh-article-trie` | None | Trie refresh result | `401`, `403`, `429` |
| `POST` | `/api/admin/tools/retrain-article-recommender` | None | Retraining job/result | `401`, `403`, `429`, `503` article ML unavailable |

### Admin Doctors

| Method | Endpoint | Request | Success response | Error cases |
| --- | --- | --- | --- | --- |
| `GET` | `/api/admin/doctors` | Query filters/pagination | Doctor list | `401`, `403` |
| `POST` | `/api/admin/doctors` | Doctor payload | Created doctor | `400`, `401`, `403` |
| `GET` | `/api/admin/doctors/:id` | Path `id` | Doctor detail | `401`, `403`, `404` |
| `PATCH` | `/api/admin/doctors/:id` | Partial doctor payload | Updated doctor | `400`, `401`, `403`, `404` |
| `DELETE` | `/api/admin/doctors/:id` | Path `id` | Deleted doctor status | `401`, `403`, `404` |
| `PATCH` | `/api/admin/doctors/:id/verify` | None | Verified doctor | `401`, `403`, `404` |
| `PATCH` | `/api/admin/doctors/:id/unverify` | None | Unverified doctor | `401`, `403`, `404` |
| `GET` | `/api/admin/doctors/:id/appointments` | Path `id` | Doctor appointment list | `401`, `403`, `404` |

### Admin Articles

| Method | Endpoint | Request | Success response | Error cases |
| --- | --- | --- | --- | --- |
| `GET` | `/api/admin/articles` | Query filters/pagination | Article list | `401`, `403` |
| `POST` | `/api/admin/articles` | Article payload | Created article | `400`, `401`, `403`, `409` |
| `POST` | `/api/admin/articles/refresh-search` | None | Search refresh result | `401`, `403` |
| `POST` | `/api/admin/articles/export-csv` | None/options | CSV/export result | `401`, `403` |
| `POST` | `/api/admin/articles/retrain-recommender` | None | Recommender retraining result | `401`, `403`, `503` |
| `GET` | `/api/admin/articles/:id` | Path `id` | Article detail | `401`, `403`, `404` |
| `PATCH` | `/api/admin/articles/:id` | Partial article payload | Updated article | `400`, `401`, `403`, `404` |
| `DELETE` | `/api/admin/articles/:id` | Path `id` | Deleted article status | `401`, `403`, `404` |
| `PATCH` | `/api/admin/articles/:id/publish` | None | Published article | `401`, `403`, `404` |
| `PATCH` | `/api/admin/articles/:id/unpublish` | None | Unpublished article | `401`, `403`, `404` |
| `PATCH` | `/api/admin/articles/:id/feature` | None | Featured article | `401`, `403`, `404` |
| `PATCH` | `/api/admin/articles/:id/unfeature` | None | Unfeatured article | `401`, `403`, `404` |

### Admin Users, Appointments, Reports, Notifications

| Method | Endpoint | Request | Success response | Error cases |
| --- | --- | --- | --- | --- |
| `GET` | `/api/admin/users` | Query filters/pagination | User list | `401`, `403` |
| `GET` | `/api/admin/users/:id` | Path `id` | User detail | `401`, `403`, `404` |
| `PATCH` | `/api/admin/users/:id/role` | `{ role }` | Updated user | `400`, `401`, `403`, `404` |
| `PATCH` | `/api/admin/users/:id/activate` | None | Activated user | `401`, `403`, `404` |
| `PATCH` | `/api/admin/users/:id/deactivate` | None | Deactivated user | `401`, `403`, `404` |
| `GET` | `/api/admin/users/:id/sessions` | Path `id` | User sessions | `401`, `403`, `404` |
| `PATCH` | `/api/admin/users/:id/revoke-sessions` | None | Revocation result | `401`, `403`, `404` |
| `DELETE` | `/api/admin/users/:id` | Path `id` | Deleted/deactivated user status | `401`, `403`, `404` |
| `GET` | `/api/admin/appointments` | Query filters/pagination | Appointment list | `401`, `403` |
| `PATCH` | `/api/admin/appointments/:id/status` | `{ status }` | Updated appointment | `400`, `401`, `403`, `404` |
| `PATCH` | `/api/admin/appointments/:id/resolve` | Resolution payload where supported | Resolved appointment | `400`, `401`, `403`, `404` |
| `GET` | `/api/admin/reports` | Query filters/pagination | Report list | `401`, `403` |
| `GET` | `/api/admin/reports/:id` | Path `id` | Report detail | `401`, `403`, `404` |
| `DELETE` | `/api/admin/reports/:id` | Path `id` | Deleted report status | `401`, `403`, `404` |
| `POST` | `/api/admin/notifications/announcement` | Announcement payload | Queued/sent notification result | `400`, `401`, `403`, `503` queue unavailable |
| `POST` | `/api/admin/notifications/system` | System notification payload | Created/queued notification result | `400`, `401`, `403`, `503` |
| `GET` | `/api/admin/notifications` | Query filters/pagination | Admin notification list | `401`, `403` |

## ML Service Contracts

These services are separate FastAPI apps under `ml-model`.

| Service | Base URL | Endpoint | Request | Response |
| --- | --- | --- | --- | --- |
| PCOS ML | `http://localhost:8000` | `GET /health` | None | Service health/model readiness |
| PCOS ML | `http://localhost:8000` | `POST /predict-pcos` | PCOS feature payload | Probability, risk level, message, top factors, recommendation, disclaimer |
| Cycle ML | `http://localhost:8001` | `GET /health` | None | Service health/model readiness |
| Cycle ML | `http://localhost:8001` | `POST /predict-cycle-irregularity` | Cycle/lifestyle feature payload | Irregularity prediction, probability/risk-style response |
| Article ML | `http://localhost:8002` | `GET /health` | None | Service health/artifact readiness |
| Article ML | `http://localhost:8002` | Recommendation endpoint used by backend | Article slug/metadata depending on service contract | Similar article metadata |

