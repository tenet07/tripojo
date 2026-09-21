# Tripojo Frontend (React + Vite + TypeScript + Tailwind)

The Tripojo design system + the two priority MVP flows: curator onboarding
and host/hostel onboarding, plus landing page and dashboards.

## Setup

```bash
cd frontend
npm install
cp .env.example .env   # points to the local Rails API
npm run dev             # http://localhost:5173
```

Requires the `backend/` Rails API running on `http://localhost:3000` (see
`../backend/README.md`) for signup/login/onboarding to actually work —
without it the landing, signup and login pages still render, but any
authenticated screen will fail its API calls.

## What's here

```
src/design-system/   Button, FormFields (Input/Textarea/Select), Card,
                      Badge, Stepper, Toast, NavBar — the reusable kit.
                      Tokens (color/type/shadow/radius) live in
                      tailwind.config.js.
src/lib/api.ts        Thin fetch wrapper, attaches the JWT from
                      localStorage, throws ApiError with Rails' error
                      messages.
src/lib/auth.tsx       AuthProvider/useAuth — signup/login/logout,
                      persists the JWT, loads /auth/me on refresh.
src/pages/onboarding/  The priority flows:
  curator/CuratorOnboarding.tsx  Profile -> Socials -> First trip
  host/HostOnboarding.tsx        Business info -> Verification -> First property
src/pages/dashboard/   Post-onboarding curator/host dashboards.
```

Each onboarding step saves to the API immediately (PATCH profile / POST
trip or property) rather than only at the end, so progress isn't lost if
someone closes the tab mid-flow — the backend's `onboarding_step` field
tells the wizard where to resume.

## Design system

Brand palette (warm terracotta primary + deep teal secondary, warm
off-white background) lives in `tailwind.config.js` under `theme.extend.colors`.
Typography: Plus Jakarta Sans for headings, Inter for body (loaded from
Google Fonts in `index.html`). Swap either without touching component code.

## Verified in this environment

- `npx tsc -b` — clean, no type errors.
- `npm run build` — production build succeeds.
- Rendered headlessly (landing, signup, login) with zero runtime/console
  errors from the app itself.

Not verified here (no network path to rubygems in this sandbox — see
`../backend/README.md`): a live end-to-end run against the real Rails API.
Request/response shapes were hand-matched field-for-field against the
Rails controllers, but do a real signup → onboarding → dashboard pass on
your machine before treating this as production-ready.
