# SheCare

SheCare is a full-stack women's health and wellness platform. The current integration focus is authentication between the Next.js frontend and Express/MongoDB backend.

## Project Structure

```text
SheCare/
├── frontend/    # Next.js TypeScript app
├── backend/     # Express, MongoDB, Mongoose API
└── ml-model/    # ML services and experiments
```

## Run Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend runs on `http://localhost:5000`.

Required backend auth env variables:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/shecare
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

Required frontend auth env variable:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Auth Endpoints

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Protected requests use:

```http
Authorization: Bearer <accessToken>
```

## Test Credentials Example

Register a local test user with:

```json
{
  "fullName": "SheCare Test User",
  "email": "test.user@example.com",
  "password": "Password123",
  "role": "user"
}
```

Use the same email and password to log in.

## Auth Flow

1. A user registers or logs in from `/register` or `/login`.
2. Backend hashes the password, returns the user, an access token, and a refresh token.
3. Frontend stores auth state in Zustand persistence and attaches the access token to API requests.
4. Dashboard routes validate the session with `/api/auth/me`; unauthenticated users are redirected to `/login`.
5. If an API request returns `401`, the frontend calls `/api/auth/refresh` with the refresh token and retries the original request once.
6. Logout revokes the refresh-token session on the backend, clears frontend auth state, and redirects to `/login`.
