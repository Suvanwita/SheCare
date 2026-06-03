# SheCare Frontend

Next.js dashboard for the SheCare platform.

## Env Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Run Commands

```bash
npm install
npm run dev
npm run build
```

Frontend runs at `http://localhost:3000`.

## Integrated Pages

- Landing page: `/`
- Login: `/login`
- Register: `/register`
- Dashboard overview: `/dashboard`
- Cycle tracker: `/dashboard/cycle`
- Health logs: `/dashboard/health-logs`
- Reminders: `/dashboard/reminders`
- Appointments: `/dashboard/appointments`
- Reports: `/dashboard/reports`
- Analytics: `/dashboard/analytics`
- PCOS risk: `/dashboard/pcos-risk`

## Integration Notes

- All backend calls use the shared Axios client in `src/lib/api.ts`.
- Auth tokens are stored in Zustand and sent as bearer tokens.
- `401` failures clear auth state; dashboard shell redirects unauthenticated users to `/login`.
- Report uploads use `FormData` with field name `file`.
