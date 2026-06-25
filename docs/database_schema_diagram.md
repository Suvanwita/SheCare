# SheCare Database Schema Diagram

```mermaid
erDiagram
  USER {
    ObjectId _id PK
    string fullName
    string email UK
    string password
    string role
    string gender
    date dateOfBirth
    string phone
    bool isActive
    date lastLoginAt
    date createdAt
    date updatedAt
  }

  SESSION {
    ObjectId _id PK
    ObjectId user FK
    string refreshToken
    string userAgent
    string ipAddress
    date expiresAt
    bool isRevoked
  }

  CYCLE {
    ObjectId _id PK
    ObjectId user FK
    date startDate
    date endDate
    number cycleLength
    number periodDuration
    string flowIntensity
    string notes
    date predictedNextPeriod
    bool isIrregular
  }

  HEALTH_LOG {
    ObjectId _id PK
    ObjectId user FK
    date date
    string mood
    number sleepHours
    number waterIntake
    number weightKg
    number painLevel
    number stressLevel
    string notes
  }

  PCOS_ASSESSMENT {
    ObjectId _id PK
    ObjectId user FK
    object input
    object result
    date createdAt
    date updatedAt
  }

  DOCTOR {
    ObjectId _id PK
    ObjectId user FK
    string name
    string specialization
    number experienceYears
    number rating
    string location
    number consultationFee
    bool isVerified
  }

  APPOINTMENT {
    ObjectId _id PK
    ObjectId user FK
    ObjectId doctor FK
    date date
    string slot
    string appointmentType
    string status
    string meetingLink
  }

  PRESCRIPTION {
    ObjectId _id PK
    ObjectId user FK
    ObjectId doctor FK
    ObjectId appointment FK
    array medicines
    string notes
    date issuedAt
  }

  REMINDER {
    ObjectId _id PK
    ObjectId user FK
    string title
    string type
    string message
    date scheduledAt
    string repeat
    string priority
    string status
  }

  NOTIFICATION {
    ObjectId _id PK
    ObjectId user FK
    string title
    string message
    string type
    bool isRead
    object metadata
  }

  REPORT {
    ObjectId _id PK
    ObjectId user FK
    string title
    string category
    string doctorName
    string fileName
    string originalName
    string mimeType
    number size
    string path
  }

  ARTICLE {
    ObjectId _id PK
    string title
    string slug UK
    string category
    string summary
    string content
    string coverImage
    array tags
    array keywords
    number readingTime
    string author
    bool featured
    bool isPublished
    number views
    number bookmarksCount
  }

  AUDIT_LOG {
    ObjectId _id PK
    ObjectId user FK
    string action
    string entity
    ObjectId entityId
    object metadata
    string ipAddress
    string userAgent
  }

  ANALYTICS_EVENT {
    ObjectId _id PK
    string eventType
    string topic
    ObjectId user FK
    ObjectId entityId
    object payload
    date occurredAt
  }

  USER ||--o{ SESSION : owns
  USER ||--o{ CYCLE : tracks
  USER ||--o{ HEALTH_LOG : records
  USER ||--o{ PCOS_ASSESSMENT : completes
  USER ||--o{ APPOINTMENT : books
  USER ||--o{ REMINDER : creates
  USER ||--o{ NOTIFICATION : receives
  USER ||--o{ REPORT : uploads
  USER ||--o{ AUDIT_LOG : performs
  USER ||--o{ ANALYTICS_EVENT : generates
  USER ||--o| DOCTOR : profile
  DOCTOR ||--o{ APPOINTMENT : accepts
  USER ||--o{ PRESCRIPTION : receives
  DOCTOR ||--o{ PRESCRIPTION : issues
  APPOINTMENT ||--o| PRESCRIPTION : produces
```

## Important Indexes

| Collection | Indexes |
| --- | --- |
| `users` | `role`, `isActive`, unique `email` |
| `sessions` | `user`, `refreshToken`, TTL `expiresAt` |
| `cycles` | `user + startDate`, `isIrregular` |
| `healthlogs` | `user + date`, `mood` |
| `appointments` | `user + date`, `doctor + date + slot`, `status` |
| `articles` | `category`, `tags`, `keywords`, `featured`, text search |
| `pcosassessments` | `user + createdAt`, `result.risk_level` |
| `reminders` | `user + scheduledAt`, `status`, `type` |
| `notifications` | `user + createdAt`, `user + isRead` |
| `reports` | `user + createdAt`, `category`, `mimeType` |
| `auditlogs` | `user + createdAt`, `entity + entityId`, `action` |
| `analyticsevents` | `eventType`, `topic`, `occurredAt`, `user` |

