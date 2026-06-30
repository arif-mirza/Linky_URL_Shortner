# Project Instructions and Implementation Guide

This document explains how the Linkly project works end to end, what is used, and how each feature flow executes step by step.

## 1. What Is Used

## Runtime and Framework
- Next.js 16 App Router
- React 19
- TypeScript

## State Management
- Redux Toolkit
- React Redux

## Styling and UI
- Tailwind CSS v4
- Lucide React icons
- next/font for typography (`Plus Jakarta Sans`, `Sora`)

## Data Persistence
- PostgreSQL database via `DATABASE_URL`
- Persistence adapter in `src/api/server/db.ts` (DB-only)

## 2. Directory Responsibilities

- `app/`
  - Route pages and API handlers.
  - `app/s/[code]/route.ts`: public redirect endpoint.
  - `app/api/**`: auth and links APIs.

- `src/api/server/`
  - Core domain logic.
  - `auth.ts`: register/login and token verification logic.
  - `links.ts`: link CRUD, ownership, duplicate checks, guest limits, redirect resolution.
  - `db.ts`: PostgreSQL adapter with direct SQL operations.

- `src/store/`
  - Redux store and async thunks.
  - Error handling and loading state control.

- `src/hooks/`
  - Feature-specific hooks wrapping store logic.
  - `useAuth`, `useLinks`.

- `src/components/`
  - Visual components and page sections.
  - Header, hero shortener, history table, auth forms.

## 3. Step-by-Step Feature Flows

## 3.1 App Boot Flow
1. `app/layout.tsx` mounts global providers and header.
2. `Header` calls `bootstrapSession()` from `useAuth`.
3. `useAuth` initializes runtime auth state in Redux.
4. Auth stays in memory for the active runtime session.
5. Home page calls `loadLinks()` and retrieves owner-scoped links.

## 3.2 Registration Flow
1. User submits form on `/register`.
2. `RegisterClientPage` dispatches `registerThunk`.
3. API call goes to `POST /api/auth/register`.
4. Server validates payload and creates user record + auth token.
5. Client stores token in runtime memory and Redux state.
6. Redux auth state updates and UI redirects to `/`.

## 3.3 Login Flow
1. User submits form on `/login`.
2. `loginThunk` calls `POST /api/auth/login`.
3. Server verifies password hash with timing-safe compare.
4. Auth token is returned in response.
5. Client stores token in runtime memory and Redux state.
6. Redux auth state updates to logged-in.

## 3.4 Guest and Owner Resolution Flow
1. Request reaches `app/api/links/route.ts`.
2. Server attempts user lookup via `Authorization: Bearer <token>`.
3. If not authenticated, server resolves owner via `x-linkly-guest-id` header.
4. Owner scope is always one of:
   - Authenticated user id
   - Guest id (`guest:UUID`)

## 3.5 Create Short Link Flow
1. Hero input submits URL.
2. `useLinks.shortenLink` dispatches `createLinkThunk`.
3. `POST /api/links` validates URL protocol and owner.
4. `createLink` in server logic applies rules:
   - guest max 5 links
   - no duplicate original URL in same owner scope
   - unique code generation
5. Record is inserted directly into PostgreSQL via `db.ts`.
6. Response returns normalized link DTO.

## 3.6 Auto Copy Flow
1. User enables `Auto Copy to Clipboard` toggle.
2. On successful shorten, created link is copied automatically.
3. Copy operation uses:
   - `navigator.clipboard.writeText` when available
   - fallback `document.execCommand('copy')` when needed
4. Hero shows a short success animation message.

## 3.7 Manual Copy Flow (Table)
1. User clicks copy icon beside a short URL.
2. Absolute URL is copied.
3. Copy icon switches to animated checkmark briefly.
4. UI state resets after timeout.

## 3.8 QR Code Flow
1. Server DTO includes `qrCodeUrl`.
2. QR data is generated from absolute short URL (`/s/{code}` with app base URL).
3. Table renders QR preview image and links to full QR image.

## 3.9 Redirect Flow
1. User opens `/s/{code}`.
2. `resolveCode(code)` searches active link.
3. On success:
   - click count increments
   - browser receives redirect to original URL
4. If code not found or inactive: 404 JSON response.

## 3.10 Update and Delete Flow
1. Table actions trigger PATCH/DELETE on `/api/links/[id]`.
2. Server resolves owner (auth token or guest header).
3. Operation is allowed only when owner matches link owner.
4. Redux updates list state after success.

## 4. UI and Design System Notes

- Brand identity is centralized through `BrandLogo`.
- Heading typography uses `Sora`.
- Body typography uses `Plus Jakarta Sans`.
- Color palette uses dark blue surfaces with blue/pink gradient accents.
- Background image source: `public/images/bg.png`.

## 5. How to Run Step by Step

1. Install packages
```bash
npm install
```

2. Start development server
```bash
npm run dev
```

3. Open app
```text
http://localhost:3000
```

4. Test core scenarios
- Guest create links until limit (5)
- Register and verify unlimited creation
- Copy short URL and verify copied animation
- Enable auto copy and create new link
- Open short URL route and validate redirect + click increment

5. Validate production build
```bash
npm run build
```

## 6. Configuration Tips

- Set `NEXT_PUBLIC_APP_URL` (or `APP_URL`) for correct absolute QR/copy targets in deployed environments.
- Set `DATABASE_URL` to enable required PostgreSQL persistence.

## 7. Known Constraints

- Auth token is runtime-memory only, so users login again on full page refresh.

## 8. Extension Guide (Recommended)

If you want to extend the project safely, use this order:
1. Add server-domain logic in `src/api/server/`.
2. Expose functionality through `app/api/` route handlers.
3. Add thunk in Redux slice.
4. Expose in custom hook.
5. Consume in component.
6. Validate with `npm run build`.
