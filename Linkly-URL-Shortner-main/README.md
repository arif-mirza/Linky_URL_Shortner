# Linkly

Linkly is a full-stack URL shortener built with Next.js App Router, TypeScript, and Redux Toolkit.

It includes:
- Authentication (register, login, logout)
- URL shortening and redirect handling
- Guest mode with usage limits
- Link history, status toggle, delete actions
- QR code generation and copy-to-clipboard support

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Redux Toolkit + React Redux
- Tailwind CSS v4
- Lucide React icons

## Project Structure

- `app/`: App Router pages and API routes
- `src/api/server/`: Server domain logic for auth and links
- `src/store/`: Redux store and slices
- `src/hooks/`: Feature hooks (`useAuth`, `useLinks`)
- `src/components/`: UI and feature components
- PostgreSQL persistence via `DATABASE_URL`
- `public/images/bg.png`: Background image asset

Detailed architecture and flow documentation:
- `docs/PROJECT_INSTRUCTIONS.md`

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Start development server

```bash
npm run dev
```

3. Open the app

```text
http://localhost:3000
```

## Build and Production Check

Run a production build:

```bash
npm run build
```

Start production server:

```bash
npm run start
```

## Environment Variables

Required and optional variables:

- `DATABASE_URL` (required)

- `NEXT_PUBLIC_APP_URL`
- `APP_URL`

If not set, the app falls back to:

```text
http://localhost:3000
```

## Key Functional Behavior

- Guest users are tracked by an in-memory guest id on the client runtime.
- Guest users can create up to 5 short links.
- Logged-in users have no link creation limit.
- Duplicate URLs are blocked per owner scope.
- Short links resolve from `/s/{code}`.
- QR and copy actions use absolute URLs.

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

## Troubleshooting

1. If links do not persist as expected:
: Verify `DATABASE_URL` points to a reachable PostgreSQL instance.

2. If copied URLs are relative or wrong:
: Set `NEXT_PUBLIC_APP_URL` for your environment.

3. If login resets after browser refresh:
: This is expected in non-persistent runtime auth mode.

4. If QR does not open correctly on mobile:
: Confirm your app URL variable points to a reachable host.

## Notes for Developers

- API route handlers are intentionally thin and delegate to domain logic in `src/api/server/`.
- UI state and API error handling is centralized through Redux thunks.
- Copy operations include Clipboard API support with fallback behavior.
