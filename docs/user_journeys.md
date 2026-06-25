# SheCare User Journey Documentation

This document describes key user and admin workflows from login to outcomes.

## Actors

| Actor | Goals |
| --- | --- |
| User | Track health, manage cycles, receive reminders, book doctors, upload reports, read articles, view analytics |
| Doctor | Maintain doctor profile and manage appointment-related work where role support exists |
| Admin | Manage users, doctors, articles, appointments, reports, notifications, audit logs, and operations |
| Background worker | Process reminders and notifications |
| Kafka consumer | Materialize analytics and audit trails |

## User Journey: Account Creation To Dashboard

```mermaid
flowchart TD
  A[Open SheCare] --> B[Register]
  B --> C[Backend creates user and session]
  C --> D[Frontend stores auth state]
  D --> E[Dashboard opens]
  E --> F[User sees care modules]
```

Steps:

1. User opens the frontend.
2. User registers with full name, email, password, and role.
3. Backend hashes password, creates `User`, signs access and refresh tokens, creates `Session`.
4. Frontend stores auth state in `shecare-auth` local storage.
5. User lands in dashboard and can access protected care features.

Outcome:

- Authenticated user session.
- User can create personal health records.

## User Journey: Login And Session Refresh

```mermaid
flowchart TD
  A[User logs in] --> B[Backend validates password]
  B --> C[Access token issued]
  C --> D[User uses dashboard]
  D --> E{Access token expired?}
  E -- No --> D
  E -- Yes --> F[Frontend calls refresh]
  F --> G{Refresh session valid?}
  G -- Yes --> H[New access token]
  H --> D
  G -- No --> I[Clear auth and return to login]
```

Outcome:

- Smooth dashboard usage while refresh session is valid.
- Failed refresh clears auth and protects private data.

## User Journey: Cycle Tracking

```mermaid
flowchart TD
  A[Open Cycle page] --> B[Add period start/end and symptoms]
  B --> C[Backend validates date fields]
  C --> D[Backend calculates cycle length]
  D --> E[Cycle saved]
  E --> F[Analytics updated from cycle records]
  F --> G[User reviews trends and predicted next period]
```

User outcome:

- Period/cycle history is stored.
- Cycle trends and predicted next period become available.
- Irregular cycle count can be shown in analytics.

## User Journey: Daily Health Logging

```mermaid
flowchart TD
  A[Open Health Logs] --> B[Enter mood, symptoms, sleep, hydration, pain, stress]
  B --> C[Save HealthLog]
  C --> D[Dashboard and analytics read updated data]
  D --> E[User sees patterns over time]
```

User outcome:

- Daily wellness context is captured.
- Analytics can summarize sleep, hydration, pain, stress, and symptoms.

## User Journey: Reminder To Notification

```mermaid
flowchart TD
  A[User creates reminder] --> B[Backend saves Reminder]
  B --> C[BullMQ schedules reminder job]
  C --> D[Reminder worker processes due job]
  D --> E[Notification job is queued]
  E --> F[Notification worker creates Notification]
  F --> G[User reads notification]
```

User outcome:

- Medicine, cycle, appointment, or custom reminders trigger notifications.
- One-time reminders can be completed; repeat reminders can continue.

## User Journey: Doctor Booking

```mermaid
flowchart TD
  A[Browse doctor directory] --> B[Filter/select doctor]
  B --> C[Choose date, slot, appointment type]
  C --> D[Backend checks slot availability]
  D --> E{Available?}
  E -- No --> F[Show conflict]
  E -- Yes --> G[Create Appointment]
  G --> H[Emit appointment event]
  H --> I[User sees booking confirmation]
```

User outcome:

- Appointment is created with doctor/date/slot/status.
- Appointment appears in user appointment history.

## User Journey: Report Upload

```mermaid
flowchart TD
  A[Open Reports] --> B[Choose PDF/JPG/PNG]
  B --> C[Upload multipart form]
  C --> D[Backend validates file]
  D --> E[File stored in reports upload folder]
  E --> F[Report metadata saved]
  F --> G[Report event emitted]
  G --> H[User can view report list]
```

User outcome:

- Report metadata is stored with the user account.
- User can organize medical documents.

## User Journey: PCOS Risk Assessment

```mermaid
flowchart TD
  A[Open PCOS Risk page] --> B[Enter clinical/symptom fields]
  B --> C[Backend calls PCOS ML service]
  C --> D[ML returns probability and risk level]
  D --> E[Backend saves PCOSAssessment]
  E --> F[Kafka pcos event emitted]
  F --> G[User sees result and recommendation]
```

User outcome:

- PCOS assessment history is saved.
- Result includes probability, risk level, contributing factors, recommendation, and disclaimer.

Safety note:

- The result is informational support, not medical diagnosis.

## User Journey: Knowledge Hub

```mermaid
flowchart TD
  A[Open Knowledge Hub] --> B[Search/filter articles]
  B --> C[Open article]
  C --> D[Backend increments views]
  D --> E[Request similar articles]
  E --> F[Article ML service ranks related content]
  F --> G[User continues reading]
```

User outcome:

- User receives educational content.
- Similar article recommendations help continue learning.

## User Journey: Analytics And Timeline

```mermaid
flowchart TD
  A[User creates domain activity] --> B[Backend emits Kafka event]
  B --> C[Analytics consumer saves AnalyticsEvent]
  C --> D[User opens timeline]
  D --> E[Timeline API reads AnalyticsEvent]
  E --> F[User sees activity history]
```

User outcome:

- User sees health activity over time.
- Analytics summarizes health, cycle, reminder, appointment, and PCOS patterns.

## Admin Journey: Admin Login To Operations

```mermaid
flowchart TD
  A[Admin logs in] --> B[Auth token includes role]
  B --> C[Admin route guard checks role]
  C --> D[Admin dashboard opens]
  D --> E[Manage users/doctors/articles/appointments/reports]
  E --> F[Successful writes create audit logs]
```

Admin outcome:

- Admin can operate the platform.
- Successful writes are audit logged.

## Admin Journey: User Management

Steps:

1. Admin opens `/admin/users`.
2. Admin searches or filters users.
3. Admin views user detail.
4. Admin changes role, activates/deactivates account, revokes sessions, or deletes user.
5. Backend writes admin audit log.

Outcome:

- User lifecycle and access control can be managed centrally.

## Admin Journey: Article Management

Steps:

1. Admin opens `/admin/articles`.
2. Admin creates or edits article content.
3. Admin publishes/unpublishes or features/unfeatures articles.
4. Admin refreshes search trie or retrains recommender when content changes.
5. Backend invalidates article caches and emits article/admin events.

Outcome:

- Knowledge Hub stays curated and searchable.
- Recommendations can be retrained from current content.

## Admin Journey: Operations And Audit

Steps:

1. Admin opens tools/status.
2. Admin verifies MongoDB counts and ML service configuration.
3. Admin reviews audit logs.
4. Admin reviews analytics overview.
5. Admin sends global or targeted notifications if needed.

Outcome:

- Admin can monitor and operate SheCare without direct database access.

