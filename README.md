# Formlyst

A pnpm workspace monorepo with two apps:

- **`apps/api`** — a [NestJS](https://nestjs.com/) backend, running as native ESM.
- **`apps/client`** — a [TanStack Start](https://tanstack.com/start) (React) frontend, full-stack with SSR and server functions on Vite + Nitro.

`packages/*` is reserved for future shared code and is currently empty.

## Prerequisites

- Node.js
- [pnpm](https://pnpm.io/)

## Getting started

```bash
pnpm install
pnpm dev
```

`pnpm dev` runs both apps concurrently — the api via `nest start --watch` and the client via `vite dev`.

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
| `pnpm typecheck` | `tsc --noEmit` on both apps |
| `pnpm test` | Runs api's vitest suite (client has no test runner configured yet) |

### api specifics

- Tests use [vitest](https://vitest.dev/), not jest. Unit specs (`**/*.spec.ts`) run via `vitest.config.ts`; e2e specs (`**/*.e2e-spec.ts`, under `apps/api/test/`) run via `pnpm --filter api run test:e2e`.
- To run a single test file or pattern: `pnpm --filter api exec vitest run src/app.controller.spec.ts` or add `-t "test name"`.
- Additional scripts: `test:watch`, `test:cov`, `test:debug` (`--inspect-brk --no-file-parallelism`), run via `pnpm --filter api run <script>`.
- Linting is via [oxlint](https://oxc.rs/docs/guide/usage/linter.html), not eslint.

### client specifics

- File-based routing via TanStack Router: routes live in `src/routes/`, with `src/routeTree.gen.ts` auto-generated — never hand-edit it.
- Env vars are validated with [T3Env](https://env.t3.gg/)/Zod in `src/env.ts` — client-exposed vars must be prefixed `VITE_` and declared there.
- Path aliases `#/*` and `@/*` both resolve to `./src/*`.
- UI components use [shadcn/ui](https://ui.shadcn.com/) (`style: "new-york"`, Tailwind v4, lucide icons). Add a component with `pnpm dlx shadcn@latest add <component>`.
- Linting is eslint via `@tanstack/eslint-config`; formatting is prettier.

## Project structure

```
apps/
  api/      # NestJS backend
  client/   # TanStack Start frontend
packages/   # reserved for future shared code
```
