# SheCare Backend

Node.js, Express, MongoDB, and Mongoose backend for SheCare.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

The server runs on `http://localhost:5000` by default.

## Health Check

```bash
GET http://localhost:5000/health
```

Example response:

```json
{
  "success": true,
  "message": "SheCare backend is running",
  "timestamp": "2026-05-31T00:00:00.000Z",
  "environment": "development"
}
```
