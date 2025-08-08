## Project Modernization Roadmap

This document is the single source of truth for the rebuild and modernization effort. Update checkboxes as tasks complete. Keep sections concise and living.

### Project principles

- [ ] Keep it simple, fast, testable
- [ ] Prioritize clarity over cleverness
- [ ] Security, observability, performance by default

## Phase 0 — Scope and decisions

- [ ] Define core domain: contacts, customers, carriers, locations, orders, documents, users/roles
- [ ] Prioritize v1 features: login, dashboard, contacts, customers, orders, documents
- [ ] Choose tech stack
  - [ ] Frontend: Next.js + React + TypeScript + Tailwind CSS v4 + shadcn/ui
  - [ ] Backend: NestJS + TypeScript + Fastify + Prisma
  - [ ] DB: PostgreSQL
  - [ ] Caching/queues: Redis (optional in v1)
  - [ ] File storage: S3-compatible (MinIO in dev)
  - [ ] Auth: JWT with rotating refresh tokens (Argon2id)
  - [ ] Infra: Docker (+ docker-compose for dev), GitHub Actions CI/CD
  - [ ] Telemetry: OpenTelemetry, Prometheus, Grafana, Sentry
- [ ] Non-functional goals agreed (e.g., p95 < 150ms API, 99.9% uptime)
- [ ] Domain language and module boundaries defined

## Phase 1 — Repo, dev env, CI/CD

- [x] Monorepo scaffolding (apps: `web`, `api`; packages: `ui`, `config`, `types`)
- [x] Dockerized dev (Next.js, NestJS, Postgres, Redis, MinIO, Mailpit)
  - [x] docker-compose with services and volumes
  - [x] Dockerfiles for `web` and `api`
- [x] CI: typecheck, lint, build on PR
  - [x] GitHub Actions workflow configured
- [x] Precommit hooks: eslint, prettier, lint-staged
- [x] Base security headers (Next.js + NestJS middlewares)
- [x] Dependency update policies (Dependabot + security scanning)

### Phase 1 — Enterprise-grade baselines

- [ ] Package manager policy
  - [x] Choose and enforce npm across repo (.npmrc, engines)
  - [x] Commit a single lockfile at root; enforce in CI
  - [x] Set root `packageManager` to npm (remove Yarn declarations) to prevent auto-installs
  - [x] Remove stray Yarn lockfiles and ignore `yarn.lock` repo-wide
- [x] CI hardening
  - [x] Use `npm ci` with caching instead of `npm install`
  - [ ] Enforce `tsc --noEmit` typecheck across workspaces in CI
  - [ ] Add `typecheck` scripts per workspace and a root aggregator
  - [ ] Remove `|| true` so CI fails on type errors
  - [x] Add `prettier --check` gate
  - [x] Add test job placeholder (will be wired in Phase 9)
- [x] Supply chain security
  - [x] Container/image scanning (Trivy) for `apps/web` and `apps/api` images in CI
  - [x] SBOM generation in CI (Syft/Anchore) with artifact upload
  - [x] Enable GitHub secret scanning and push protection (repo settings)
  - [x] Add LICENSE file
- [x] Governance and policies
  - [x] Add `CODEOWNERS`
  - [x] Add `SECURITY.md` (reporting, disclosure, support window)
  - [x] Add `CODE_OF_CONDUCT.md`
  - [x] Add `CONTRIBUTING.md` (PR process, commit rules)
  - [x] Enforce conventional commits (commitlint workflow); document branch protection rules
- [ ] Developer experience
  - [x] Add `.nvmrc` to pin Node version
  - [x] Add `.devcontainer` for consistent local setup
  - [x] Root README (added to legacy README section)
  - [ ] docker-compose API dev: run in watch mode and inject container-local env (avoid `node dist/main.js`)
- [ ] Branch protection and repo posture
  - [ ] Branch protection: require status checks (lint, build, test), signed commits, linear history (repo settings)
  - [x] OSSF Scorecard workflow enabled
- [x] Container hardening
  - [x] Pin Docker base images by digest (replace tag-only images)

## Phase 2 — Backend foundation (NestJS)

- [x] Bootstrap NestJS (Fastify)
- [x] Global config + env validation (ConfigModule + Joi)
- [x] Add Prisma Postgres connection (local Postgres 16)
- [x] Prisma schema: users, roles, sessions/tokens, contacts, customers, orders, locations, documents
  - [x] `User` model
  - [x] `Role` enum and RBAC field on user
  - [x] `RefreshToken` model (sessions/tokens)
  - [x] `Contact` model
- [x] DB migrations pipeline (Prisma migrate dev)
- [x] Error handling middleware/filters
- [x] Request ID interceptor + basic request logging
- [x] OpenAPI (Swagger at /docs); versioned API prefix
- [x] Prisma hygiene: remove SQLite leftovers; keep Postgres-only migrations; add seed wiring
- [ ] JWT/config: require `JWT_SECRET` (no defaults) and validate `DATABASE_URL`, SMTP vars

## Phase 3 — AuthN/AuthZ

- [x] Password hashing (Argon2id)
- [x] Password policy (min length/complexity)
- [x] Login, refresh with rotation; revoke-all support
- [x] Logout endpoint wiring and device/session tracking
- [x] RBAC: roles on user and route guards
- [x] Email verification, password reset (single-use token + expiry)
- [x] CSRF (if cookie-based), rate limiting, brute-force protection
- [x] Audit log for auth events
- [x] MFA (TOTP) with setup/verify/disable; enforce TOTP at login when enabled
- [x] Mailer integration: send signed links for verify/reset (no token echo outside tests)
- [x] Session metadata and binding: store/validate ip and userAgent for refresh tokens
- [x] Password history recorded on reset/change

## Phase 4 — Frontend foundation (Next.js)

- [ ] App Router, TypeScript strict, Tailwind CSS v4 configured
  - [x] Tailwind v4 base config wired to app
  - [ ] Install shadcn/ui and set up theme tokens
- [ ] Shared UI package for design primitives
- [ ] Routing, layout shells, protected routes
- [ ] Data layer: TanStack Query + typed client + error boundaries
- [ ] Forms: React Hook Form + zod resolver
- [x] Tailwind v4 PostCSS setup (`@tailwindcss/postcss`); npm-only lockfile enforced
- [ ] CSP (nonce-based) with strict script-src and style-src once routes/assets are finalized
- [ ] Fix type dependencies for React 18: `@types/react@18`, `@types/react-dom@18`, `@types/node`

### Immediate next steps

- [x] Install and initialize Prisma in `apps/api`; create initial schema and migration
- [x] Wire `.env` for Postgres and run migration in dev
- [ ] Install shadcn/ui in `apps/web`; generate base components and theme
- [ ] Add initial auth pages (sign-in, reset password) using shadcn/ui
- [ ] Fix web type deps and start dev server (`@types/react@18`, `@types/react-dom@18`, `@types/node`)
- [x] Add CI skeleton (GitHub Actions) for install → typecheck → lint → build

## Phase 5 — Core domain APIs

- [x] Contacts: CRUD, search, pagination
- [x] Contacts: soft-delete
- Customers
  - [x] CRUD
  - [x] Ownership
  - [ ] Tags
- Locations
  - [x] CRUD
  - [x] Ownership
  - [ ] Geo fields and validation
- Orders
  - [x] CRUD
  - [x] Ownership
  - [ ] Status state machine, validation, pricing placeholders
- Documents
  - [x] CRUD
  - [x] Ownership
  - [ ] Signed upload/download URLs, metadata, preview
- [ ] Webhooks/events (internal pub/sub for side effects)

## Phase 6 — Core UI screens (shadcn/ui only)

- [ ] Auth: sign-in, reset password, session management
- [ ] Dashboard: KPIs, recent activity
- [ ] Contacts: list, filters, detail, edit
- [ ] Customers: list, detail, edit
- [ ] Orders: list, filters, detail, edit; timeline; status changes
- [ ] Documents: upload (with progress), list, preview, download
- [ ] Settings: profile, password, API tokens (if needed)
- [ ] Accessibility pass (keyboard, contrast, ARIA)

## Phase 7 — Observability and ops

- [ ] OpenTelemetry tracing + logs + metrics (API + web)
- [ ] Prometheus scrape + Grafana dashboards (latency, error rate, saturation)
- [ ] Sentry for FE/BE errors
- [x] Health endpoints, readiness/liveness probes
- [ ] Structured audit logging for critical events
- [ ] Define SLOs (availability, latency p95/p99) and alerting thresholds
- [ ] Synthetic monitoring for key user journeys

## Phase 8 — Security hardening

- [ ] Content Security Policy (nonce-based), HSTS, XFO, Referrer-Policy, Permissions-Policy
- [ ] Input validation on all endpoints, output encoding in UI
- [ ] Rate limiting and abuse protection on public endpoints
- [ ] Consolidate rate limiting strategy (choose Nest Throttler or `@fastify/rate-limit`, not both)
- [ ] Secrets: runtime env only, rotation policy, no secrets in VCS
- [ ] Dependency scanning + patch cadence
- [ ] Backup/restore and disaster recovery drills
- [ ] DAST (dynamic app security testing) against staging

## Phase 9 — Testing strategy

- [ ] Unit tests: services, helpers, domain logic
- [ ] Integration tests: Prisma + API modules (test DB)
- [ ] Contract tests for external services (if added)
- [ ] E2E tests: Playwright critical paths
- [ ] Load test baselines; regression alerts on p95/p99
- [ ] Coverage thresholds in CI (enforced min %)

## Phase 10 — Performance and resilience

- [ ] N+1 and hot-path profiling; indexes, query budgets
- [ ] Caching strategy (Redis) for hot queries
- [ ] Background jobs & retries; idempotency keys
- [ ] Circuit breakers/timeouts for external calls
- [ ] Chaos drills (latency, faults) in staging

## Phase 11 — Data import/export (optional)

- [ ] CSV or API importers with validation
- [ ] Export flows for reporting
- [ ] Data ownership and retention policies

## Phase 12 — Documentation and handoff

- [ ] Architecture decision records (ADRs)
- [ ] Dev onboarding guide
- [ ] Runbooks for incidents
- [ ] API reference and UI usage patterns

## Phase 13 — Release and post-launch

- [ ] Release checklist: migrations, seed data, feature flags
- [ ] Canary/blue-green deploy
- [ ] Post-launch monitoring SLOs and alerts
- [ ] Stabilization sprint and backlog grooming

### Deliverables checklist (high level)

- [ ] Monorepo with `web` (Next.js) and `api` (NestJS), CI/CD
- [x] Postgres schema + Prisma migrations
- [x] Auth with JWT rotation, Argon2id, RBAC, email verification + password reset, MFA (TOTP)
- [ ] v1 domain APIs (contacts, customers, orders, locations, documents)
- [ ] v1 UI built with shadcn/ui + Tailwind v4 only
- [ ] Observability (OTel, Sentry, Grafana), security headers, rate limiting
- [ ] Test suites (unit, integration, E2E), baseline load test
- [ ] Docs, runbooks, ADRs

### Nice-to-haves (future)

- [ ] Feature flags (e.g., Unleash)
- [ ] Search with Postgres FTS or OpenSearch
- [ ] Multi-tenant support
- [ ] SSO/OIDC providers
- [ ] PWA enhancements

### Notes for contributors

- Use short, imperative commit messages per checkbox (e.g., "Phase 3: add Argon2id hashing").
- Keep PRs small and scoped to a checklist item.
- Update this file in each PR that completes a task.
