<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# FixMate client

Single Next.js 16.4.6 App Router app (no monorepo): React 19.3, TypeScript strict, Tailwind v4 (CSS-first), shadcn `base-nova` on Base UI primitives, better-auth + MongoDB Atlas, npm. `@/*` maps to `src/*`. The sibling `../fixMate-server` (Express, same MongoDB `fixmate` database) is the data API.

## Commands

```bash
npm run dev       # Turbopack dev server, loads .env
npm run lint      # bare `eslint` (flat config); lints the whole repo
npx eslint src/path/to/file.tsx  # focused lint
npx tsc --noEmit  # no typecheck script exists
npm run build     # final gate: Turbopack + TypeScript + prerender
```

- No tests, CI, formatter, or pre-commit hooks. `lint -> tsc -> build` is the entire verification.
- Fresh clone: run `npm run dev` or `npm run build` once before `npx tsc --noEmit`, otherwise tsc fails on the generated `LayoutProps`/`PageProps` types.
- The Express backend must run separately (`cd ../fixMate-server && node index.js`, port 5000) for services, technicians, and dashboard data. It has no npm start script.

## Config that changes how you write code

`next.config.ts` is non-default:

- `cacheComponents: true` — uncached async work must sit under `<Suspense>` (the services sections are wrapped this way). This repo uses no `"use cache"` yet, so don't add it casually. Route segment config is rejected under this flag: `export const runtime` in `/api/upload` failed the build and had to be removed.
- `reactCompiler: true` — Rules of React enforced; no render-time side effects.
- `partialPrefetching: true`, Turbopack is the default. CSS is wired through the `*.css` -> `@tailwindcss/turbopack` rule, so webpack-only config does nothing.
- `experimental.agentFeedback: true` — `next dev` owns the feedback block at the bottom of this file.

## AGENTS.md is machine-managed

Text between `<!-- BEGIN:nextjs-agent-* -->` and `<!-- END:nextjs-agent-* -->` is rewritten by `next dev` (see `node_modules/next/dist/server/lib/generate-agent-files.js`). Keep custom guidance outside those markers and commit this file with your work.

## Routes and structure

- Route groups add no URL segment: `(public)` is the marketing/services site, `(auth)` serves `/signin` and `/signup`, `(users)` is the signed-in dashboard area.
- `(public)` routes: `/`, `/about`, `/services`, `/services/[id]`, `/services/[id]/book`, `/technicians`, `/technicians/[id]`, `/checkout/success`. `(public)/layout.tsx` renders `Navbar` inside `<Suspense>` (cacheComponents) plus `Footer`.
- `(auth)` has **no** layout, so auth pages render standalone — no navbar/footer.
- `(users)` routes: `/admin`, `/admin/all-bookings`, `/admin/manage-users`, `/admin/service-approval`, `/admin/transactions`, `/customer`, `/technician`, `/profile`. Its layout renders `DashboardShell` and only checks for a session; every page must call `requireRole(...)` or `requireSession()` from `src/lib/session.ts`. `/dashboard` is a route handler that redirects via `dashboardPathForRole`.
- Roles are `admin`, `technician`, `customer` (default). `requireRole` redirects to the caller's own dashboard rather than returning 403.
- Dynamic/async page props are Promises in Next 16: `params` in `services/[id]`, `technicians/[id]`, `book`, and `searchParams` in `services` must be awaited.
- `/services/[id]` and `/services/[id]/book` resolve `fetchApprovedServices()` by `_id` or `slug`; unapproved/inactive services 404. `/technicians` and `/technicians/[id]` are implemented via `fetchTechnicians()`.
- Route-local components: `src/app/(public)/components/**` and `src/app/(users)/components/**` (shared Navbar/Footer in `public/.../shared/`). Reusable primitives: `src/components/ui/` (`accordion`, `avatar`, `button`, `carousel`, `checkbox`, `dropdown-menu`, `input`, `label`, `select`, `spinner`, `toast`).
- `proxy.ts` at the repo root is Next 16's replacement for `middleware.ts`. It redirects legacy `/service/*` to `/services/*` and runs an optimistic cookie check on `/dashboard`, `/admin`, `/customer`, `/technician`, `/profile`, sending signed-out users to `/signin?next=...`. It does not validate the session against MongoDB; `requireRole`/`requireSession` remain the real authorization checks.
- `src/app/success/page.tsx` is the unused Stripe sample page; the live payment return is `/checkout/success`.

## Data and integrations

- `BASE_API_URL` is the **separate services backend** (`../fixMate-server`, currently `http://localhost:5000`), used server-side only. Shared fetchers: `src/lib/services.ts` (approved catalogue), `src/lib/dashboard-data.ts` (users/services/bookings/transactions), `src/lib/technicians.ts` (technician list/detail). `Category.tsx` and `LatestServices.tsx` still duplicate the `/services` fetch locally. Each caller catches failures and renders a fallback.
- Reads go straight to the Express API from server components. Browser mutations go through Next route handlers (`/api/users/[id]`, `/api/services/[id]`, `/api/bookings/[id]`, `/api/transactions`) which check the better-auth session/role, then proxy with `cache: "no-store"`. Never call `BASE_API_URL` from a client component.
- The Express API itself has **no auth or role checks** and allows all CORS origins. All authorization lives in this app; don't expose the Express URL to the browser or rely on it to enforce permissions.
- Both apps share MongoDB database `fixmate`. better-auth owns the `user` collection; Express reads it and owns `services`, `bookings`, `transactions`. Schema changes on either side affect the other.
- Fetch helpers call `await connection()` before hitting the API to skip prerendering (otherwise React reports `HANGING_PROMISE_REJECTION`), and their callers must sit under `<Suspense>` because `cacheComponents: true`. Keep `await connection()` outside `try/catch` in pages, or the prerender abort gets swallowed.
- better-auth runs **inside this app** at `/api/auth/[...all]/route.ts`. The browser client is same-origin (`createAuthClient()` with no `baseURL`) — do not point it at `BASE_API_URL`. Add endpoints through `src/lib/auth.ts`, not new route files.
- `src/lib/auth.ts` adds `role`, `phone`, `serviceArea`, `bio` to the user model. Signup lets the visitor choose `customer` or `technician`; only an admin can assign `admin` via `PATCH /api/users/[id]`.
- `src/lib/auth-client.ts` imports `type { auth }` from the server config for `inferAdditionalFields<typeof auth>()`. Keep it `import type`; a value import pulls `mongodb` into the browser bundle.
- `src/lib/auth.ts` opens `new MongoClient(process.env.MONGODB_URI)` at module scope (database `fixmate`). An Atlas URI pasted with the placeholder brackets (`fixmate>`, trailing `>`) authenticates as the wrong user and fails with `bad auth`. `next build` then still exits 0, so a green build does not prove the DB works — verify with a ping or a real auth request.
- `POST /api/upload` is the only image path (ImgBB via `IMAGEBB_API_KEY`, 5 MB, jpeg/png/webp/gif). Signup and profile call it, then pass the returned URL to better-auth. ImgBB can reject a valid-looking key with HTTP 400 code 103 ("forbidden"); the route returns 502 — that is an account-side block, not a code bug.
- Social auth: both `/signin` and `/signup` call `signIn.social({ provider })` (there is no `signUp.social`). OAuth callbacks are `/api/auth/callback/{google,github}` and must be registered in the provider consoles.
- Payments use hosted Stripe Checkout. `/services/[id]/book` collects address/date and `POST /api/checkout_sessions` builds the session server-side from the approved service price in BDT (the browser never sends an amount). `/checkout/success` verifies `payment_status === "paid"` and then writes the booking + transaction directly to the Express API, checking `stripeSessionId`/reference first so reloads cannot duplicate them. `src/lib/stripe.ts` is server-only; `STRIPE_SECRET_KEY` must be set (test keys start with `sk_test_`).
- Post-repair customer payment (`CustomerBookings.tsx`) posts `/api/transactions` first, then `PATCH /api/bookings/[id]` with `paymentStatus: "paid"`. Keep that order.

## UI conventions

- **Layout width uses `container mx-auto` + responsive padding, never `max-w-*` wrappers** (a user requirement). Text-width `max-w` on paragraphs and truncation is fine.
- Tailwind v4 is CSS-first: no `tailwind.config.*`; theme tokens (`@theme inline`) live in `src/app/globals.css`, which imports `shadcn/tailwind.css`.
- Add components with `npx shadcn add <name>` (`components.json`: style `base-nova`, Base UI). Generated code imports `@base-ui/react/*`, not Radix, and uses Base UI's `render` prop instead of `asChild`.
- `cn` must come from `@/lib/utils`, which re-exports the `cn` npm package. Don't swap in clsx + tailwind-merge.
- Toasts: `src/components/ui/toast.tsx` exports a global `toast` manager and `<Toaster />` is mounted in the root layout. Use `toast.add({ title, description, type: "success" | "error" | ... })`.
- Images come from `src/assets/*` (JPEG/WebP content despite `.png` names) via static imports passed to `next/image`; remote HTTPS images are allowlisted by wildcard.

## Environment

`.env` is gitignored (`env*`) and there is no `.env.example`. Required: `MONGODB_URI`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (must match the browser origin, e.g. `http://localhost:3000`), `BASE_API_URL`, `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET`, `IMAGEBB_API_KEY`, `STRIPE_SECRET_KEY`. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is present but unused by hosted Checkout.

The sibling `../fixMate-server` needs its own `.env` with `MONGODB_URI` (same Atlas database) and optional `PORT` (default 5000).

`.github/copilot-instructions.md` mirrors most of this; keep it in sync when conventions change.

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->
