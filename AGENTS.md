# AGENTS.md

Brandy is a platform to manage the branding assets of your company(s) from a
single central point. This file is the agent entry point for this repo.

## Guardrails

The organization's coding standards are **mirrored in this repo** under
[.agents/guardrails/](.agents/guardrails/) (synced from the `guardrails`
repo). Read them before writing code:

- **Always-on:** `rules/GENERAL.MD`, `rules/NAMING.MD`,
  `rules/FEATURE-FOLDER.MD`, `rules/FALLBACKS.MD`, `rules/TOOLING.MD`,
  `rules/ENV-VARS.MD`
- **Stack-specific:** `rules/ORPC.MD` + `rules/VALIDATION.MD` (oRPC + Zod),
  `rules/STYLING.MD` (Mantine sections)
- **Task-dependent:** `rules/REACT.MD`, `rules/NEXTJS.MD`,
  `rules/DATA-FETCHING.MD`, `rules/STATE-MANAGEMENT.MD`,
  `rules/DATA-TABLES.MD`, `rules/AUTH.MD`, `rules/DRIZZLE.MD`,
  `rules/SEEDING.MD`, `rules/API-CONTRACT.MD`, `rules/SEO.MD`
- Copy-ready patterns live in `.agents/guardrails/examples/`.

## Hard rules (non-negotiable)

1. No file exceeds ~150 lines. Split on growth. Enforced by `bun run guard`.
2. No relative imports - absolute aliases only (`@/...`).
3. Arrow functions with named exports; default exports only in
   `src/app/**/page.tsx`, `layout.tsx`, `route.ts`.
4. Feature-first folders (`src/features/<feature>/{schema,server,services,components}`).
5. The UI library owns styling - no `className`/`style` overrides of Mantine.
6. Server state goes through TanStack Query via the typed oRPC client;
   URL/filter state lives in nuqs.
7. `process.env` is read only in `src/shared/env.server.ts`, `src/shared/env.ts`
   and the root config files; everything else imports validated `env`.
8. No `@ts-ignore`, `@ts-expect-error`, or `as any` casts.

## Project-specific adaptations to the guardrails

- **Single app, not a monorepo.** Seeding lives in `src/server/seed/index.ts`
  and composes feature seeders from `src/features/<feature>/server/seed/`
  (same pattern, no `packages/db`).
- **Drizzle schemas** are `src/features/<feature>/schema.ts` (plus
  `brand-schema.ts` in assets); the single client is `src/shared/lib/db.ts`;
  migrations live in `./migrations` and are committed.
- **Storage** is behind `src/shared/lib/storage` (disk adapter today,
  S3-compatible later). Features never touch paths directly.
- Elysia/Eden, React Native and shadcn rules do not apply to this stack.

## Verification before finishing any task

```
bun format && bun lint && bun typecheck && bun run guard
```

The pre-commit hook (lefthook) runs `biome check --write` + typecheck + the
guard script, but it is a backstop - verify before committing.
