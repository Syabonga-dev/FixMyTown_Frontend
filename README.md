# PhilaLink

A Vite + React frontend for the PhilaLink public health platform, built to talk to an
ASP.NET Core backend (Swagger at `http://localhost:5174/swagger/v1/swagger.json` by default).

## Getting started

```bash
npm install
cp .env.example .env      # then fill in the values below
npm run dev                # http://localhost:5173
```

## Configuring the backend connection

Everything the app needs is in `.env`:

```bash
# .env
VITE_API_BASE_URL=https://localhost:5174
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-js-api-key
```

- **`VITE_API_BASE_URL`** — the origin of your ASP.NET Core API. Every request the frontend
  makes goes through `src/services/api/client.js`, which prefixes this base URL onto each
  path (e.g. `POST /api/auth/login`). Change this one value to point the whole app at a
  different environment (local, staging, production) at build time.
- **`VITE_GOOGLE_MAPS_API_KEY`** — used only by `src/components/maps/ClinicMap.jsx` on the
  Clinic Finder page. Restrict the key to your domain(s) in the Google Cloud Console. If
  it's missing, the map falls back to a plain list of clinics instead of failing.

Anything prefixed `VITE_` is bundled into the client JS and is **public** — never put a
JWT signing secret, database credential, or the Anthropic API key here. The chatbot's
Anthropic key belongs only in the ASP.NET Core backend's configuration/secret store; see
"Chatbot integration" below.

### CORS vs dev proxy

By default the browser calls `VITE_API_BASE_URL` directly, so make sure CORS is enabled
on the ASP.NET Core side for `http://localhost:5173`. If you'd rather avoid CORS
entirely during development, uncomment the `server.proxy` block in `vite.config.js` and
point it at your backend — the app already calls relative `/api/...` paths, so no other
change is needed.

## Where things are configured

| Concern | File |
| --- | --- |
| Backend base URL, auth headers, 401/refresh handling, error shape | `src/services/api/client.js` |
| Auth endpoints (login, register, verify phone, /me, logout) | `src/services/api/auth.js` |
| Session state, login/logout, role | `src/context/AuthContext.jsx` |
| Route guards (must be logged in / must have role X) | `src/routes/ProtectedRoute.jsx` |
| All page routes | `src/App.jsx` |
| Google Maps loading + fallback | `src/components/maps/ClinicMap.jsx` |
| Philani AI chatbot (frontend half) | `src/components/chatbot/PhilaniChatbot.jsx` + `src/services/api/chatbot.js` |

## Authentication

The frontend expects a JWT-based auth flow from the backend:

- `POST /api/auth/login` `{ idNumber, password, role }` → `{ token, refreshToken, user }`
- `POST /api/auth/register/patient` — **the only public self-registration route.** Nurse
  and Proxy accounts are never created this way (see below).
- `POST /api/auth/verify-phone` `{ userId, code }` → `{ token, refreshToken, user }`
- `GET /api/auth/me` → current user, used to re-hydrate a session on page load
- `POST /api/auth/refresh` `{ refreshToken }` → new `{ token, refreshToken, user }`,
  called automatically and silently by the API client on a 401
- `POST /api/auth/logout`

The token and user are kept in `localStorage` (`src/services/api/client.js`'s
`tokenStore`) and attached as `Authorization: Bearer <token>` to every authenticated
request. Adjust the paths in `src/services/api/auth.js` if your controllers differ —
nothing else needs to change.

## Role-based routing

`src/routes/ProtectedRoute.jsx` exports two guards used in `App.jsx`:

- **`ProtectedRoute`** — redirects to `/login` if there's no authenticated session.
- **`RoleRoute allow={[...]}`** — wraps a group of routes (e.g. everything under
  `/nurse`) and redirects to the current user's *own* dashboard if their role isn't in
  the allow-list. This means a Patient can never reach `/nurse/*` by editing the URL —
  the check happens client-side on every navigation, and should also be enforced with
  `[Authorize(Roles = "...")]` server-side, since a client-side check alone is not a
  security boundary.

Each role's dashboard lives at its own root: `/patient`, `/nurse`, `/proxy`, `/admin`.

## Registration model

Only **patients** can self-register, via `/register` → `/register/verify` →
`/register/success`. There is no public role picker.

Nurse and Proxy accounts are created by an **Admin**, from
`/admin/register-staff` (`POST /api/admin/staff`), which requires an authenticated
Admin session — enforce this server-side too. The Login page has a small "Administrator
sign in" link that swaps the role toggle for an Admin login, so an Admin can log in and
reach that screen without it cluttering the normal Patient/Nurse/Proxy login.

## Chatbot integration (Philani AI)

The browser **never** holds an Anthropic API key and never calls Anthropic directly. It
only talks to your backend:

- `POST /api/chatbot/message` `{ message, history }` →
  `{ reply, isEmergency, missingFields? }`
- `GET /api/chatbot/history` / `DELETE /api/chatbot/history` (optional, for persisting
  conversations per patient)

Implement the `/api/chatbot/message` controller action to call Anthropic's API from
ASP.NET Core (key stored in `appsettings`/user-secrets/environment, never in git), and
re-run the emergency-keyword and medication-safety checks server-side as a second line
of defense — the frontend's job is just to render the conversation and forward it.

## Google Maps (Clinic Finder)

`src/components/maps/ClinicMap.jsx` lazy-loads the Maps JavaScript API using
`VITE_GOOGLE_MAPS_API_KEY` and renders a marker per clinic returned from
`GET /api/clinics?lat=&lng=&radiusKm=`. If the key is missing or the script fails to
load, it falls back to a plain clickable list so the page never breaks.

## Project structure

```
src/
  assets/            logo etc.
  components/
    chatbot/         Philani AI widget
    layout/          Sidebar, Topbar, AuthenticatedLayout
    maps/            ClinicMap (Google Maps)
    ui/              Button, Card, Input, StatusChip, Toast, Spinner, EmptyState
  context/           AuthContext
  lib/               useApi data-fetching hook
  pages/
    auth/            Login, Register, PhoneVerification, RegistrationSuccess
    patient/         Dashboard, Medications, SymptomChecker, ClinicFinder, Notifications
    nurse/            Dashboard, Patients, Collections, AuditLog
    proxy/            Dashboard, Patients
    admin/            Dashboard, RegisterStaff, ManageStaff
  routes/            ProtectedRoute, RoleRoute
  services/api/      One file per backend resource — the only place fetch() is called
  App.jsx
  main.jsx
```

## Build

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build locally
```
