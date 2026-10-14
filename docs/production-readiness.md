# Production readiness

**Assessment date:** 14 October 2026  
**Decision:** Not ready for public production launch. Suitable for a controlled
technical beta after the deployment prerequisites below are verified.

## Current status

The repository contains a functioning Next.js application and a complete
Product Manager simulation flow: career detail and briefing, task-based
workplace interaction, persisted transcript, rubric evaluation, dashboard, and
data deletion. Email/password authentication, profile/session/evaluation API
routes, Supabase data-access code, row-level-security schema, Gemini manager
gateway, structured logging, input validation, and request rate limiting are
also present.

The live paths are configuration-dependent. Supabase schema deployment,
production credentials, email delivery, Redis rate limiting, and real Gemini
calls have not been verified against deployed services in this workspace.
Development without Supabase still intentionally uses browser-local data and
deterministic AI stand-ins. Production no longer uses those stand-ins when
Supabase or Gemini is unavailable; those requests fail with an explicit
configuration/service error instead of returning success-shaped demo data.

The AI request path was tightened to bind the requested simulation and task to
the authenticated session, and to avoid sending a persisted student answer to
Gemini twice. An unused simulation-quota placeholder and a visible forced-error
demo control were removed.

## Functionality and scope

| Area | Status |
| --- | --- |
| Main student journey | Implemented for Product Manager; requires deployed backend for production persistence |
| Career catalogue | One playable scenario; concept-only roles are hidden until implemented |
| Authentication | Supabase email/password routes and session middleware exist; production email/domain setup unverified |
| Persistence | Supabase tables and per-user RLS policies are described in `docs/supabase-schema.sql`; deployment not verified |
| Manager interaction | Gemini gateway exists; live credentials/provider behavior unverified; production requires Upstash rate limiting |
| Evaluation | Fixed-rubric, deterministic scoring with evidence from student answers; not an AI-adaptive assessment |
| Dashboard/settings | User data flows through APIs in backend mode; local browser storage remains development-only |
| Realtime | Request/response API only; no WebSocket or Supabase Realtime synchronization |
| Tests | Unit tests and public-page browser smoke tests exist; authenticated service workflows need E2E coverage |

## Required before public launch

1. **Complete production configuration:** deploy and verify the SQL schema and
   RLS policies; configure Supabase URL/keys, callback URLs, email templates,
   SMTP/domain, Gemini credentials, and Upstash Redis; run `npm run db:check`
   and authenticated signup/signin/session/evaluation/deletion smoke tests in
   the deployment environment. Never put the service-role or Gemini keys in
   public variables.
2. **Close the dependency and release gates:** keep Next.js on a patched
   supported release, resolve every production-impacting `npm audit` finding,
   run lint/typecheck/unit/build checks in CI, and extend Playwright coverage
   for signup, resuming a session, provider failure/retry, evaluation, and data
   deletion.
3. **Finish product scope deliberately:** build and validate each additional
   simulation before marking it available. The source currently owns the
   career and scenario catalogue; an authenticated content-management workflow
   and database-backed scenario versioning are needed before non-developer
   teams can change it without a release.
4. **Clarify the claimed live features:** implement Realtime only if shared
   live updates are a product requirement. The current individual simulation
   is HTTP request/response and does not synchronize changes between devices.
   The larger specification's learning pathways, community, group chat,
   events, mentor/admin tools, payments, and content moderation are not part of
   this implementation.
5. **Operational and student-safety readiness:** add production error/latency
   monitoring, backup/restore verification, an incident process, retention and
   deletion policy, privacy/consent review for student data (including minors),
   and accessibility/localization review for Sinhala and Tamil.

## Engineering changes in this update

- Updated Next.js to the patched 15.5 line and added the missing ESLint
  development dependencies so the configured lint command can run.
- Production persistence no longer silently switches to browser-local storage.
- Production AI-provider failures no longer return a deterministic mock reply;
  development demo mode remains available.
- Production rate limiting now fails closed if Upstash is missing or unreachable;
  local development remains usable without Redis.
- Simulation requests now reject mismatched session/scenario/task identifiers.
- Only playable career simulations are shown, and session creation rejects
  scenarios that are not linked to an available career.
- Gemini receives the latest persisted student answer once, not twice.
- Removed an inert quota stub and the user-visible demo control that fabricated
  an AI failure.

## Remaining launch blockers

- No deployment or live Supabase/Gemini/Upstash credentials were available for
  this assessment, so real-service operation is not certified.
- The full product described in the technical specification is not built; the
  deliverable is a one-simulation beta, not the final multi-role system.
- Operational review, E2E coverage, and launch policies are incomplete.
- Production dependency audit is clean with `npm audit --omit=dev`; the full
  development dependency tree still reports toolchain vulnerabilities that
  need a planned ESLint/Tailwind upgrade.
- Validation completed: production build, typecheck, lint (one existing font
  warning), 45 unit tests, and 3 public-page Playwright smoke tests pass.
- `npm run db:check` cannot pass without `SUPABASE_URL` and
  `SUPABASE_SERVICE_ROLE_KEY`; no live backend credentials were available.
