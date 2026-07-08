# Redis Implementation in SheCare

SheCare integrates **Redis** (powered by the `ioredis` library) to handle high-performance caching, distributed rate limiting, and background queue management. This document provides a detailed breakdown of its implementation across different system modules.

---

## 1. Caching Layer (`utils/cache.js`)

Caching is used on read-heavy, low-volatility endpoints to reduce MongoDB load and accelerate response times.

### Cache Keys and Keyspaces
Cache keys are defined as constants inside [cache.js](file:///home/user/Desktop/SheCare/backend/utils/cache.js):
- `articles:list`: Standard cache for pageable, filtered articles lists.
- `articles:slug:${slug}`: Caches detailed content of an article by its unique slug.
- `articles:similar:${slug}`: Caches list recommendations for similar articles.
- `admin:analytics:overview`: Caches system metrics for the administrative console.
- `doctors:list`: Caches active medical professionals and their specialties.

### Cache Operations
- **Fail-Open Strategy**: Reading (`getCache`) and writing (`setCache`) are wrapped in `try-catch` blocks. If Redis is down, it prints warnings to the log, bypasses the cache, and queries MongoDB directly to prevent API outages.
- **Pattern Scanning**: When data is modified (e.g. an article is updated or published), the system invalidates relevant caches using the `deleteByPattern(pattern)` function. This uses Redis `SCAN` matching keys incrementally (rather than the blocking `KEYS` command) to find and delete keys safely in a production environment.

---

## 2. Rate Limiting Middleware (`middleware/rateLimiter.js`)

To protect the server from brute-force attacks and resource exhaustion, SheCare implements `express-rate-limit` integrated with `rate-limit-redis`.

- **Isolated Redis Connections**: The rate limiter duplicates the core Redis connection to create dedicated client interfaces. This ensures rate limiter operations don't block main caching or worker connection pools.
- **Limiter Configurations**:
  - **Auth Limiter** (`rate-limit:auth:`): Restricts login and registration endpoints to a maximum of 10 requests per 15-minute window.
  - **ML Proxy Limiter** (`rate-limit:ml:`): Limits calls to the PCOS machine learning prediction proxy to 30 requests per hour.
  - **General API Limiter** (`rate-limit:api:`): Restricts standard users to 300 requests per 15 minutes.

---

## 3. Queue Management (BullMQ)

For asynchronous, retryable, or time-delayed jobs, SheCare utilizes the **BullMQ** library, which stores all job states, queues, and locks in Redis.

- **Connection Reuse**: The BullMQ connection utilizes the core Redis client configuration, creating a duplicate connection optimized for queue operations.
- **Notification Queue**: Handles the distribution of user alerts, SMS notifications, and system notifications via background consumers.
- **Reminder Queue**: Manages scheduled reminders (e.g. period tracking alerts, medication times) and processes them at their designated times.
- **Failures Handling**: If BullMQ cannot connect to Redis during job dispatch, the API returns a `503 Service Unavailable` response to prevent job loss.
