# SheCare Event Catalog

This document lists Kafka topics, emitted event types, payload shapes, and consumers.

## Event Envelope

Events emitted by controllers generally follow this shape:

```json
{
  "eventType": "domain.action",
  "entityId": "MongoObjectId",
  "userId": "MongoObjectId",
  "role": "user",
  "payload": {},
  "timestamp": "ISO timestamp added by producer where configured"
}
```

Kafka emission uses:

```text
emitKafkaEventSafely(topic, event)
```

If Kafka is unavailable, API requests continue and the failure is logged.

## Topics

| Constant | Topic | Primary producers | Consumers |
| --- | --- | --- | --- |
| `USER_EVENTS` | `user.events` | Auth controller | Analytics consumer |
| `APPOINTMENT_EVENTS` | `appointment.events` | Appointment controller | Analytics consumer |
| `REMINDER_EVENTS` | `reminder.events` | Reminder controller | Analytics consumer |
| `REPORT_EVENTS` | `report.events` | Report controller | Analytics consumer |
| `PCOS_EVENTS` | `pcos.events` | PCOS controller | Analytics consumer |
| `ARTICLE_EVENTS` | `article.events` | Article/admin controllers | Analytics consumer |
| `ADMIN_EVENTS` | `admin.events` | Admin controller | Audit consumer |
| `AUDIT_EVENTS` | `audit.events` | Admin middleware | Audit consumer |
| `ANALYTICS_EVENTS` | `analytics.events` | Reserved | Reserved |

## Consumers

### Analytics Consumer

File:

```text
backend/consumers/analyticsConsumer.js
```

Group ID:

```text
shecare-analytics-consumer
```

Consumes:

- `user.events`
- `appointment.events`
- `reminder.events`
- `report.events`
- `pcos.events`
- `article.events`

Writes:

```text
AnalyticsEvent
```

Stored fields:

- `eventType`
- `topic`
- `user`
- `entityId`
- `payload`
- `occurredAt`

PCOS payloads are sanitized to:

- `riskLevel`
- `confidence`
- `createdAt`

### Audit Consumer

File:

```text
backend/consumers/auditConsumer.js
```

Group ID:

```text
shecare-audit-consumer
```

Consumes:

- `audit.events`
- `admin.events`

Writes:

```text
AuditLog
```

Stored fields:

- `user`
- `action`
- `entity`
- `entityId`
- `metadata`
- `ipAddress`
- `userAgent`

## User Events

Topic:

```text
user.events
```

### `user.registered`

Emitted when a user registers.

Example payload:

```json
{
  "eventType": "user.registered",
  "entityId": "userId",
  "userId": "userId",
  "role": "user",
  "payload": {
    "email": "user@example.com",
    "fullName": "Jane Doe",
    "ipAddress": "127.0.0.1",
    "userAgent": "Mozilla/5.0"
  }
}
```

### `user.logged_in`

Emitted after successful login.

Payload:

```json
{
  "ipAddress": "127.0.0.1",
  "userAgent": "Mozilla/5.0"
}
```

### `user.logged_out`

Emitted after logout.

Payload:

```json
{
  "ipAddress": "127.0.0.1",
  "userAgent": "Mozilla/5.0"
}
```

## Appointment Events

Topic:

```text
appointment.events
```

Payload shape:

```json
{
  "actorId": "actorUserId",
  "doctorId": "doctorId",
  "date": "2026-01-01T10:00:00.000Z",
  "slot": "10:00 AM",
  "status": "pending",
  "appointmentType": "online"
}
```

Likely event types:

- `appointment.created`
- `appointment.status_updated`
- `appointment.deleted`
- `appointment.cancelled`

The exact event type is passed by controller actions into `emitAppointmentEvent`.

## Reminder Events

Topic:

```text
reminder.events
```

Payload shape:

```json
{
  "actorId": "userId",
  "title": "Medicine reminder",
  "type": "medicine",
  "scheduledAt": "2026-01-01T08:00:00.000Z",
  "repeat": "daily",
  "status": "upcoming"
}
```

Likely event types:

- `reminder.created`
- `reminder.updated`
- `reminder.completed`
- `reminder.deleted`

## Report Events

Topic:

```text
report.events
```

Payload shape:

```json
{
  "actorId": "userId",
  "title": "Blood test report",
  "category": "Lab",
  "mimeType": "application/pdf",
  "size": 245760,
  "fileName": "timestamp-random.pdf"
}
```

Likely event types:

- `report.uploaded`
- `report.deleted`

## PCOS Events

Topic:

```text
pcos.events
```

### `pcos.assessment.completed`

Emitted after a PCOS prediction is saved.

Example:

```json
{
  "eventType": "pcos.assessment.completed",
  "entityId": "assessmentId",
  "userId": "userId",
  "role": "user",
  "payload": {
    "riskLevel": "Moderate",
    "confidence": 0.72,
    "createdAt": "2026-01-01T08:00:00.000Z"
  }
}
```

Note: current ML response uses `probability`; the event payload references `confidence`. Keep this naming aligned if downstream analytics needs exact probability values.

## Article Events

Topic:

```text
article.events
```

Payload shape:

```json
{
  "actorId": "userId",
  "actorRole": "admin",
  "slug": "understanding-pcos-symptoms",
  "title": "Understanding PCOS Symptoms",
  "category": "PCOS",
  "tags": ["pcos", "hormones"],
  "isPublished": true,
  "featured": false
}
```

Likely event types:

- `article.created`
- `article.updated`
- `article.deleted`
- `article.published`
- `article.unpublished`
- `article.featured`
- `article.unfeatured`
- `article.viewed`

## Admin Events

Topic:

```text
admin.events
```

Admin user event payload:

```json
{
  "actorId": "adminUserId",
  "actorRole": "admin",
  "previousRole": "user",
  "newRole": "admin"
}
```

Admin general event payload:

```json
{
  "actorId": "adminUserId",
  "actorRole": "admin",
  "entity": "articles",
  "action": "retrain"
}
```

Used for:

- User role changes.
- User activation/deactivation.
- Doctor/admin tool operations.
- Article/admin operational events.

## Audit Events

Topic:

```text
audit.events
```

### `audit.admin_write`

Emitted by `auditAdminWrites` middleware after successful admin writes.

Example:

```json
{
  "eventType": "audit.admin_write",
  "entityId": "entityId",
  "userId": "adminUserId",
  "role": "admin",
  "payload": {
    "user": "adminUserId",
    "action": "admin:patch",
    "entity": "admin/users",
    "entityId": "targetUserId",
    "metadata": {
      "path": "/api/admin/users/targetUserId/role",
      "params": {
        "id": "targetUserId"
      },
      "query": {}
    },
    "ipAddress": "127.0.0.1",
    "userAgent": "Mozilla/5.0"
  }
}
```

## Timeline Mapping

Timeline API reads `AnalyticsEvent` records and turns them into user-facing activity items.

Currently highlighted event types include:

- `pcos.assessment.completed`
- `appointment.created`
- `reminder.created`
- `report.uploaded`
- `article.viewed`
- `health_log.created`

Not every model write currently emits Kafka events. Timeline richness depends on events being emitted and the analytics consumer running.

## Operational Notes

- Run `npm run kafka:init` before starting consumers.
- Keep `consumer:analytics` running for timeline/analytics event materialization.
- Keep `consumer:audit` running for Kafka-backed audit persistence.
- API requests still succeed if Kafka is unavailable.
- Malformed Kafka messages are skipped and logged.

