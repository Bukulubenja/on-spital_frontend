# hms-web

Staff/admin web frontend for the [hms-spring-boot](../hms-spring-boot) REST API — a
separate project with its own history, consuming that backend purely as a JSON API
over HTTP Basic Auth.

## Status

Proof-of-concept: login (validated via `GET /api/whoami`) + an admin dashboard
(`GET /api/admin/dashboard`) showing live stats, recent patients, and recent payments.
No other screens yet — this was the first slice, wired end-to-end to prove the whole
chain (CORS, tenant header, auth) works before building out the rest.

## Talking to the backend

The backend has no session/JWT login endpoint — every request carries HTTP Basic Auth
(`Authorization: Basic ...`) plus an `X-Hospital-Subdomain` header to select the tenant
(the `app.debug`-gated fallback `TenantResolvingFilter` supports, since a browser can't
override the `Host` header the way subdomain routing normally works). `AuthContext`
holds `{ subdomain, username, password }` in `sessionStorage` and `api/client.ts`
attaches both headers to every request. This is a deliberate simplification matched to
how the backend is built (stateless, Basic Auth, no dedicated login flow) — fine for an
internal tool over HTTPS, not something to carry into a public-facing app.

The backend must have `APP_CORS_ALLOWED_ORIGINS` including this app's origin
(`http://localhost:5173` in dev — see `hms-spring-boot`'s `SecurityConfig` and
`application.yml`, defaulted there already for local dev).

## Run

```bash
npm install
npm run dev
```

Requires `hms-spring-boot` running separately (see its own README/skill for how to
start it against Postgres). `.env.development` points at `http://localhost:8080` by
default.

## Fixture login (local dev)

Any of the seeded `stjohns` hospital users work, e.g. `admin` / `TestPass123!` (see
`hms-spring-boot`'s README for the full fixture-user list and how to reset passwords
if unknown).
