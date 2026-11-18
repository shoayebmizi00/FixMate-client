# FixMate Copilot Instructions

## Project shape

- This is a single Next.js 16 App Router application with React 19 and strict TypeScript.
- App routes live in `src/app/**`; the `@/*` alias maps to `src/*`.
- Route groups do not add URL segments: `(public)` serves `/`, `(auth)/signin` serves `/signin`, and `(auth)/signup` serves `/signup`.
- Reusable UI primitives live in `src/components/ui/`. Route-specific public-site components are colocated under `src/app/(public)/components/`.
- Static files live in `public/`; the logo and page images currently use imports from `src/assets/`.

## Commands and verification

Use npm and the scripts in `package.json`.

```bash
npm run dev
npm run lint
npx eslint src/path/to/file.tsx
npx tsc --noEmit
npm run build
npm run start
```

- There is currently no test runner or test script. Do not invent a test command; verify behavior by linting, type-checking, and an appropriate production build.
- For a single-file lint check, run `npx eslint src/path/to/file.tsx`.
- Run `npm run dev` or `npm run build` once after a fresh clone before the first type-check. Next generates `next-env.d.ts` and route `PageProps`/`LayoutProps` types that `tsc` expects.
- `npm run build` uses Turbopack and prerendering. MongoDB and better-auth are exercised during build and may report database credentials errors even though Next exits successfully.

## Required environment

The app loads `.env` for development and build. The repository has no `.env.example`; keep secrets in `.env*`, which is gitignored. Required variables include:

- `MONGODB_URI`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `BASE_API_URL`
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`
- `IMAGEBB_API_KEY` for `POST /api/upload`

`src/lib/auth.ts` constructs the MongoDB client and selects the `fixmate` database at module scope, so authentication and build-adjacent code require a usable MongoDB configuration.

## Architecture and integration points

- The root layout in `src/app/layout.tsx` supplies global fonts, metadata, global CSS, and the app-wide toast viewport.
- `(public)/layout.tsx` adds the public `Navbar` and `Footer`. Most marketing and landing-page UI is assembled by `src/app/(public)/page.tsx`.
- Authentication is provided by better-auth:
  - Server configuration: `src/lib/auth.ts`
  - Browser client and exports: `src/lib/auth-client.ts`
  - HTTP catch-all: `src/app/api/auth/[...all]/route.ts`
- Add authentication behavior through the better-auth configuration and existing `signIn`/`signUp`/`signOut`/`useSession` exports. Do not create separate auth API route files.
- The signup flow uploads avatar images through `POST /api/upload` and then passes the returned image URL to `signUp.email`. Preserve this server-mediated upload pattern.

## Framework conventions

- Consult `node_modules/next/dist/docs/` for Next.js 16 APIs instead of relying on older Next.js patterns.
- `cacheComponents: true` is enabled in `next.config.ts`. Reads that are uncached during prerendering must be inside `<Suspense>` or marked `"use cache"`.
- `reactCompiler: true` is enabled. Components must follow the Rules of React and avoid render-time side effects.
- Turbopack is the default bundler. CSS is processed through `@tailwindcss/turbopack` from Next config.
- `partialPrefetching: true` is enabled.
- Remote Next.js images are allowed from arbitrary HTTPS hosts; keep normal `next/image` usage and appropriate `sizes` values.

## UI conventions

- Tailwind CSS v4 is CSS-first: use `src/app/globals.css` for theme variables and global imports. There is no `tailwind.config.*`.
- shadcn components use the `base-nova` style and `@base-ui/react/*` primitives, not Radix primitives. Add components with `npx shadcn add <name>`.
- Import the shared `cn` helper from `@/lib/utils`; that module re-exports `cn` from the `cn` package. Do not replace it with a local clsx/tailwind-merge implementation.
- App-wide toasts are provided by `src/components/ui/toast.tsx` and mounted in the root layout. Use the exported `toast` manager for user feedback.
- Use `next/image` for imported and remote images, `next/link` for in-app navigation, and `next/navigation` hooks for client-side routing.
- Public auth and landing pages are client components where interaction state is needed, and use explicit loading, validation, and error state rather than generic success fallbacks.
