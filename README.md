# Brandy

Brandy is a platform to manage the branding assets of your company(s) from a
single central point. This repository holds the application boilerplate:
authentication, user management, audit logging, a public asset library, and
the shared infrastructure the product features will be built on.

## Tech Stack

- **Framework**: Next.js (App Router)
- **UI & Components**: Mantine UI (v9) utilizing the *Fresh Mustard* design system
- **API & Type Safety**: oRPC (End-to-End Type Safety) + React Query
- **Database & ORM**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth (Email/Password)
- **Storage**: local disk under `public/uploads` (object storage can replace it later)
- **Tooling**: Bun, Biome, TypeScript, Lefthook

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.x)
- PostgreSQL

### 1. Installation

```bash
bun install
```

This also installs the Lefthook pre-commit hooks (`biome check --write` + typecheck).

### 2. Environment Variables

```bash
cp .env.example .env
```

Point `DATABASE_URL` at your local Postgres instance and set a strong
`BETTER_AUTH_SECRET`. See the table below for every key.

### 3. Database Setup

Push the initial schema (auth, audit and asset tables):

```bash
bun run db:push
```

```bash
bun run db:generate  # SQL migrations land in ./migrations
bun run db:migrate   # run pending migrations
bun run db:studio    # Drizzle Studio
```

### 4. Seed the first administrator

```bash
bun run db:seed
```

Self sign-up is disabled (`disableSignUp`), so seeding is the only way the
first user is created. Set `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` in
`.env` first; the account is created with role `super admin` and a verified
email. Add `--force` (or `-f`) to clear existing data before seeding.

### 5. Run the development server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). Unauthenticated visitors
are redirected to `/admin/sign-in`.

### The public asset library

`/` (with `/assets` as an alias) is a **public** page - it requires no login
and is meant for sharing downloads (logos, fonts, brand kits) with people
outside the platform. Everything under `/admin` stays behind the session
gate.

## Project Structure

```
src/
  app/                 # routes: layout, providers, auth pages, dashboard, public asset library
  features/            # feature slices - each has schema / server / components / validators
    assets/            # public asset library (browse + download)
    audit/             # audit log schema, recorder, router, dashboard widgets
    auth/              # Better Auth setup, roles/permissions, user management UI
    admin/             # app shell (sidebar + header) and session gate helpers
  orpc/                # shared oRPC instance + root router
  server/seed/         # db seed entry point
  shared/              # env, db client, oRPC client, theme, table + layout components
```

### Environment Variables

Every key expected by `src/shared/env.server.ts`:

| Key | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string. |
| `BETTER_AUTH_SECRET` | Yes | Secret Better Auth signs sessions with - long and random, never an example. |
| `NEXT_PUBLIC_API_URL` | Yes (no default) | The app's public origin - used by Better Auth `baseURL`, the auth client, and password-reset links. |
| `SUPER_ADMIN_EMAIL` | No | Email of the admin created during seeding. |
| `SUPER_ADMIN_PASSWORD` | No | Password of that admin (min 8 characters). |
| `RESEND_API_KEY` | No | Enables password-reset emails; when unset, reset links are logged to the server console instead of emailed. |
| `EMAIL_FROM` | No | From-address for password-reset emails. |

## Code Quality & Tooling

- `bun run lint` - Biome lint + format check
- `bun run format` - write formatting fixes
- `bun run typecheck` - TypeScript compiler check

Lefthook runs formatting and type checking on every commit.
