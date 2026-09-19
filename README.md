# Formlyst

A pnpm workspace monorepo with two apps:

- **`apps/api`** — a [NestJS](https://nestjs.com/) backend, running as native ESM.
- **`apps/client`** — a [TanStack Start](https://tanstack.com/start) (React) frontend, full-stack with SSR and server functions on Vite + Nitro.

Plus two shared packages consumed by both apps:

- **`packages/types`** (`@formlyst/types`) — shared TypeScript types/interfaces (e.g. `User`).
- **`packages/utils`** (`@formlyst/utils`) — shared Zod validation schemas and utility functions (e.g. date formatting).

## Prerequisites

- Node.js
- [pnpm](https://pnpm.io/)
- [PostgreSQL](https://www.postgresql.org/) (with the `citext` extension available — the app creates it itself on first migration)
- [Redis](https://redis.io/) — sessions, OTP/rate-limit counters, and all auth tokens live here, not in Postgres

## Getting started

```bash
pnpm install
pnpm build:packages

# copy env templates and fill in the values (see "Environment variables" below)
cp apps/api/.env.example apps/api/.env
cp apps/client/.env.example apps/client/.env

pnpm --filter api run migration:run
pnpm dev
```

`pnpm build:packages` compiles `@formlyst/types` and `@formlyst/utils` to `dist/` — both apps import that compiled output, so it must exist before `nest start`/`vite dev` can resolve them. `pnpm dev` then runs both apps concurrently — the api via `nest start --watch` and the client via `vite dev` — but does not watch the packages; re-run `pnpm build:packages` after changing their source.

### Environment variables

Both apps need a local `.env` (gitignored) — start from their `.env.example`:

- **`apps/api/.env`** — app/database/Redis/mail config plus the auth section: `INTERNAL_API_KEY` (shared secret the client sends on every request except the two Google OAuth routes — generate one with e.g. `openssl rand -hex 32`), token TTLs, and `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`GOOGLE_CALLBACK_URL` (optional — the app boots fine without them, Google sign-in just won't work until they're set).
- **`apps/client/.env`** — `INTERNAL_API_KEY` (must match `apps/api/.env`'s value exactly), `API_BASE_URL`/`PUBLIC_API_BASE_URL` (the NestJS API's address — same value in local dev, since there's no separate public/private split), `APP_ORIGIN` (used for CSRF origin checks), and `SESSION_SECRET` (≥32 characters, seals the session cookie — generate one the same way as `INTERNAL_API_KEY`).

Run `pnpm --filter api run migration:run` once Postgres is reachable and `apps/api/.env` is filled in — it also creates the `citext` extension, so no manual `CREATE EXTENSION` step is needed.

## Commands

Run these from the repo root. Each fans out to both apps via `pnpm --filter`; append `:api` or `:client` to target one app only (e.g. `pnpm lint:api`, `pnpm test:client`).

| Command | What it does |
|---|---|
| `pnpm dev` | Runs both apps concurrently (api `nest start --watch` + client `vite dev`) |
| `pnpm build` | `nest build` (api) then `vite build` (client) |
| `pnpm start` | Runs the built api in production mode (`node dist/main`) |
| `pnpm lint` | oxlint (api) + eslint (client) |
| `pnpm lint:fix` | Same, with autofix |
| `pnpm format` | prettier `--check` on both apps |
| `pnpm format:fix` | prettier `--write` on both apps (client's also runs `eslint --fix`) |
| `pnpm typecheck` | `tsc --noEmit` on both apps (builds the shared packages first) |
| `pnpm test` | Runs api's vitest suite (client has no test runner configured yet) |
| `pnpm build:packages` | Builds `@formlyst/types` and `@formlyst/utils` to `dist/` |
| `pnpm typecheck:packages` | `tsc --noEmit` on the shared packages only |
| `pnpm --filter api run migration:run` | Applies pending TypeORM migrations (`:generate`/`:create`/`:revert` also exist) |

### Shared packages

- `packages/types` and `packages/utils` are `tsc`-built ESM packages (`dist/` output, declaration files) consumed via `"workspace:*"` from both apps.
- `pnpm build`/`pnpm build:api`/`pnpm build:client` (and their `typecheck` equivalents) always build the packages first — both apps import compiled `dist/` output, not the packages' TS source, so a fresh clone needs that build once before either app compiles.
- `pnpm dev` does not watch the packages. After editing `packages/*/src`, re-run `pnpm build:packages`, or run `pnpm --filter @formlyst/utils run dev` (or `@formlyst/types`) for a `tsc --watch` loop.
- `packages/types/src/user.ts` holds the `User` interface; `packages/utils/src/schemas/` holds the shared Zod schemas (`shared.ts`, `signin.ts`, `signup.ts`, `forgot-password.ts`, `reset-password.ts`, `set-password.ts`) and `packages/utils/src/date.ts` holds `formatDate`.

### api specifics

- Tests use [vitest](https://vitest.dev/), not jest. Unit specs (`**/*.spec.ts`) run via `vitest.config.ts`; e2e specs (`**/*.e2e-spec.ts`, under `apps/api/test/`) run via `pnpm --filter api run test:e2e`.
- To run a single test file or pattern: `pnpm --filter api exec vitest run src/app.controller.spec.ts` or add `-t "test name"`.
- Additional scripts: `test:watch`, `test:cov`, `test:debug` (`--inspect-brk --no-file-parallelism`), run via `pnpm --filter api run <script>`.
- Linting is via [oxlint](https://oxc.rs/docs/guide/usage/linter.html), not eslint.
- **Auth (`src/auth/`)**: full signup/signin/signout/refresh/password-reset/Google-OAuth system — Postgres (TypeORM) for users/identities/OTP+reset tokens, Redis for all sessions and short-lived tokens (opaque strings, no JWTs). Migrations must use TypeORM's QueryRunner schema-builder API, not raw SQL — see `CLAUDE.md` for the full architecture and the reasoning behind it.

### client specifics

- All files under `src/` use kebab-case filenames (`auth-layout.tsx`, `password-input.tsx`), regardless of the PascalCase export they contain — except TanStack Router route files, whose names follow the routing convention below.
- File-based routing via TanStack Router: routes live in `src/routes/`, with `src/routeTree.gen.ts` auto-generated — never hand-edit it. A `_`-prefixed file (e.g. `src/routes/_auth.tsx`) is a pathless layout: it wraps a group of routes in a shared layout without adding a URL segment, so `src/routes/_auth/signin.tsx` resolves to `/signin`, not `/auth/signin`. Page content lives in `src/pages/**`; route files just wire it up.
- Static brand/media files (logo, illustrations, favicons) live in `public/images/` and are referenced by absolute path (`/images/logo.svg`) rather than imported — they're served as-is with no bundler processing.
- `src/` folders: `components/common` (ours) vs `components/ui` (shadcn) vs `components/forms` (react-hook-form form components, one per form); `hooks/` (our hooks); `providers/` (our React contexts); `lib/` (frontend-only utils); `server/<feature>/` (TanStack Start server functions, one subfolder per feature, split into `<feature>.functions.ts` for the `createServerFn` wrappers, `<feature>.server.ts` for server-only helpers like DB queries — only when a feature actually needs one, and `schemas.ts` for shared client-safe validation); `types/` (mostly re-exports from `@formlyst/types`, e.g. `types/user.ts`) and `services/` reserved for future global types and an API service layer.
- Forms use `react-hook-form` + `zodResolver` against schemas imported from `@formlyst/utils` (not a local schema file), with fields wired via `Controller` into the shadcn `Field` primitives (see `components/forms/signin-form.tsx` for the pattern). Fields never arrive pre-populated — `defaultValues` are always empty and `autoComplete="off"` is set on the form and inputs.
- Env vars are validated with [T3Env](https://env.t3.gg/)/Zod in `src/env.ts` — client-exposed vars must be prefixed `VITE_` and declared there.
- Path aliases `#/*` and `@/*` both resolve to `./src/*`.
- UI components use [shadcn/ui](https://ui.shadcn.com/) (`style: "radix-mira"`, Tailwind v4, lucide icons). Add a component with `pnpm dlx shadcn@latest add <component>`.
- Internal links use `Link` from `@tanstack/react-router` (`<Link to="/signin">`), not a raw `<a href>` — reserve `<a>` for external URLs.
- Linting is eslint via `@tanstack/eslint-config`; formatting is prettier.
- **Auth (`src/server/auth/`, `src/routes/_auth/`, `src/routes/api/auth/google/`)**: this app is the BFF — it owns the one sealed session cookie (`useAppSession`, `__Host-app-session`) and is the only thing that calls the private NestJS API (via `Http`/`AuthApi` in `src/lib/`), except the two Google OAuth routes, which the browser hits directly. See `CLAUDE.md` for the env-var/import-boundary gotchas and the error-boundary convention this introduced.

## Project structure

```
apps/
  api/            # NestJS backend
  client/         # TanStack Start frontend
packages/
  types/          # @formlyst/types — shared TypeScript types
  utils/          # @formlyst/utils — shared Zod schemas & utility functions
```
