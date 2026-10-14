# Production readiness

**Assessment date:** 15 October 2026
**Decision:** Not ready for public production launch. Suitable for a controlled
technical beta after the deployment prerequisites below are verified.

## Current status

The repository contains 24 playable career simulations, including the Product
Manager role. Each has a fictional workplace case, role-specific task prompts,
skills, rubric criteria, work insights, and evidence-based evaluation. The
career flow includes detail, briefing, workplace interaction, saved transcript,
report, dashboard, and data deletion. Email/password authentication,
profile/session/evaluation API routes, Supabase data-access code,
row-level-security schema, Gemini manager gateway, structured logging, input
validation, and request rate limiting are also present.

The live paths are configuration-dependent. No local `GEMINI_API_KEY` or
Supabase credentials are configured in this workspace, so real Gemini calls
and database persistence cannot be verified here. Local development without
Supabase uses browser-local data; without a Gemini key it uses deterministic
practice replies and labels that mode in the workplace. With a key configured,
Gemini runs server-side and provider/model failures surface to the user rather
than silently changing to a mock response. Production does not use local data
or mock AI when a required service is unavailable.

The AI request path was tightened to bind the requested simulation and task to
the authenticated session, and to avoid sending a persisted student answer to
Gemini twice. An unused simulation-quota placeholder and a visible forced-error
demo control were removed.

## Functionality and scope

| Area | Status |
| --- | --- |
| Main student journey | Implemented for 24 listed roles; production persistence requires deployed backend |
| Career catalogue | 24 role-specific scenarios with tasks, evidence signals, rubrics, and role insights |
| Authentication | Supabase email/password routes and session middleware exist; production email/domain setup unverified |
| Persistence | Supabase tables and per-user RLS policies are described in `docs/supabase-schema.sql`; deployment not verified |
| Manager interaction | Gemini gateway supports local development and production; credentials/provider behavior unverified; production requires Upstash rate limiting |
| Evaluation and reports | Fixed role-specific rubric, evidence from saved answers, skill infographic, job insights, print/save as PDF; not an adaptive assessment |
| Dashboard/settings | User data flows through APIs in backend mode; local browser storage remains development-only |
| Realtime | Request/response API only; no WebSocket or Supabase Realtime synchronization |
| Tests | Unit tests cover every career scenario and report shape; public browser smoke tests cover multiple roles; authenticated service workflows need E2E coverage |

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
3. **Make scenario content manageable:** career and scenario content is
   source-controlled. Add authenticated content management and database-backed
   scenario versioning before non-developer teams need to change missions,
   evidence packets, or rubrics without a code release.
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
- All 24 catalogue roles have role-specific workplace scenarios; session
  creation rejects scenarios that are not linked to an available career.
- Gemini receives the latest persisted student answer once, not twice.
- The Gemini API key is sent in the `x-goog-api-key` header rather than a
  URL query string, reducing the chance of URL-based credential logging.
- Local simulation mode can call Gemini from the server when configured, and
  clearly distinguishes Gemini from deterministic practice replies.
- Evaluation feedback and next steps use each role's task rubric; the report
  adds evidence visualisation, role insights, and print-to-PDF support.
- Removed an inert quota stub and the user-visible demo control that fabricated
  an AI failure.

## Remaining launch blockers

- No deployment or live Supabase/Gemini/Upstash credentials were available for
  this assessment, so real-service operation is not certified.
- The broader technical specification still includes pathways, community,
  group chat, events, mentor/admin tools, payments, and moderation. Those
  services are not implemented.
- Operational review, E2E coverage, and launch policies are incomplete.
- Production dependency audit is clean with `npm audit --omit=dev`; the full
  development dependency tree still reports toolchain vulnerabilities that
  need a planned ESLint/Tailwind upgrade.
- Validation after the role expansion: production build, typecheck, lint (one
  existing font warning), 47 unit tests, and 5 Playwright browser tests pass.
- `npm run db:check` cannot pass without `SUPABASE_URL` and
  `SUPABASE_SERVICE_ROLE_KEY`; no live backend credentials were available.
- `npm run db:check` cannot pass without `SUPABASE_URL` and
  `SUPABASE_SERVICE_ROLE_KEY`; no live backend credentials were available.
