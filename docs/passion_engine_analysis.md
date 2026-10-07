# 🔍 Full-Stack Analysis: The Passion Discovery Engine
### HungryBeast — IntelliCon'26 Gate 2 Prototype

---

## 1. 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│  Next.js 14 App Router  ·  React 18  ·  TypeScript  ·  TailwindCSS │
│                                                                 │
│  Landing → Careers → Career Detail → Simulate → Evaluate → Dashboard │
└─────────────────────┬───────────────────────────────────────────┘
                      │ Server Components / API Routes
┌─────────────────────▼───────────────────────────────────────────┐
│                      SERVER (Next.js API)                        │
│  /api/ai  ·  /api/sessions  ·  /api/evaluations                 │
│  Rate Limiting (Upstash Redis)  ·  Pino Logging                 │
│  Zod Validation  ·  Structured Error Handling                   │
└───────────┬─────────────────────────────────────────────────────┘
            │
┌───────────▼────────────────────┐   ┌──────────────────────────┐
│  Supabase (Postgres + Auth)    │   │  AI Provider (Gemini)    │
│  profiles                      │   │  (NOT WIRED YET —        │
│  simulation_sessions           │   │  Mock fallback in use)   │
│  simulation_turns              │   └──────────────────────────┘
│  session_evaluations           │
│  audit_events                  │
│  Row Level Security (RLS)      │
└────────────────────────────────┘
```

**Tech Stack:**
| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18 + TypeScript |
| Styling | Tailwind CSS + custom design system |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (stubs in prototype) |
| AI | Gemini 1.5 Flash (NOT wired — mock in use) |
| Rate Limiting | Upstash Redis (sliding window) |
| Logging | Pino + pino-pretty |
| Validation | Zod |
| Testing | Vitest + Playwright |

---

## 2. ✅ Functional Features (What WORKS Right Now)

### 2.1 Complete User Journey (End-to-End Playable)
- **Landing Page** — Hero section with animated workplace preview, how-it-works steps, featured simulation CTA, and responsible-AI principles section.
- **Career Catalogue** (`/careers`) — 24 career role cards with area filters (Technology, Design, Business). Product Manager is live; others show "Soon".
- **Career Detail** — Role description, mission, AI manager profile, task sequence, difficulty, skills, and duration.
- **Simulation Prep** (`/simulate/[slug]`) — Mission briefing screen before entering the virtual workplace.
- **Virtual Workplace** (`/simulate/[slug]/run`) — The core hero screen simulating an actual work tool:
  - Company header
  - Task rail with live progress tracking
  - AI manager chat conversation
  - Student response input box
  - Loading / retry / completion states
- **AI Manager** (`lib/mockAI.ts`) — Deterministic mock that:
  - Assesses answer quality (strong / partial / thin) by word count + keyword signals
  - Selects contextual acknowledgement responses by task type and quality level
  - Detects user themes (onboarding, segmentation, bugs, etc.) and adds thematic notes
- **Evaluation** (`/evaluation/[sessionId]`) — Evidence-based evaluation with:
  - Rubric scores per criterion (1–5 scale)
  - Evidence quotes extracted from student answers
  - Observed skills (emerging / developing / demonstrated)
  - Strengths, areas to improve, next steps
  - Responsible-AI limitations disclaimer
- **Dashboard** (`/dashboard`) — Persists across browser refresh:
  - Stats: simulations completed, careers explored, skills observed
  - In-progress resume card with progress bar
  - All completed simulations list with scores
  - Suggested next career card

### 2.2 Supporting Pages
- `/onboarding` — Welcome flow (stub)
- `/signin`, `/signup` — Auth stubs (UI only, no real auth)
- `/resources` — Learning resources section
- `/settings` — Settings & privacy with "clear my data" control

### 2.3 Backend Infrastructure (Built, Partially Active)

> These are **production-ready implementations** even though not all are wired to the UI yet:

- **3 REST API Routes:** `/api/ai`, `/api/sessions`, `/api/evaluations`
- **Rate Limiting:** Two-tier Upstash Redis sliding window (global 15 req/min, per-user 30 req/min)
- **Supabase DB Layer** (`lib/db/index.ts`) — Full CRUD for profiles, sessions, turns, evaluations with RLS enforcement
- **Error Hierarchy** (`lib/error.ts`) — 7 typed error classes: `AppError`, `NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `ValidationError`, `RateLimitedError`, `ConfigurationError`, `ExternalServiceError`
- **Zod Validation** (`lib/validation.ts`) — Server-side schemas for all inputs: signup, signin, sessions, turns, evaluations, password reset
- **Pino Logging** (`lib/logger.ts`) — Structured JSON logging (dev: pretty-printed, prod: JSON)
- **AI Fallback Pattern** — API route tries real AI → gracefully falls back to mock if provider fails
- **SQL Schema with RLS** (`docs/supabase-schema.sql`) — Full Postgres schema with Row Level Security policies, indexes, and triggers (auto-profile-create on auth signup)

### 2.4 Design System
- **Custom Tailwind tokens** — `brand`, `teal`, `accent`, `amber` colour palettes; `ink`, `ink-muted`, `ink-faint` for text hierarchy; `work-*` tokens for the workplace dark theme
- **Fully responsive** — Phone → tablet → desktop
- **Keyboard-friendly** — Interactive states throughout
- **Micro-animations** — `animate-fade-up`, `animate-pulse-dot`, `hover:-translate-y-1`, `hover:shadow-lift`
- **Accessibility** — semantic HTML, heading hierarchy, `aria-*` patterns

---

## 3. ❌ Non-Functional Features (Stubs / Not Yet Working)

| Feature | Status | Notes |
|---|---|---|
| **Real AI (Gemini)** | ❌ Not wired | `generateAiManagerReply()` explicitly throws → mock fallback always used |
| **Authentication** | ❌ Stub only | Sign-in/up pages exist as UI shells; `requireUser()` will throw in production without Supabase creds |
| **Real Database** | ❌ Not connected | `lib/store.ts` uses `localStorage`; `lib/db/index.ts` is built but unused by UI |
| **Rate Limiting** | ❌ Inactive | Upstash credentials not set → `rateLimitEnabled = false`, all requests pass |
| **Cross-device Persistence** | ❌ LocalStorage only | Data is per-browser; no login = no sync across devices |
| **Multiple Career Simulations** | ❌ PM only | 23 of 24 careers are marked `available: false`, display "Soon" |
| **Password Reset Flow** | ❌ Schema only | `passwordResetRequestSchema` + `passwordResetConfirmSchema` built; no route/UI |
| **Email Confirmation** | ❌ Schema only | `authConfig.enableEmailConfirmation = true` but no auth is wired |
| **Magic Links** | ❌ Disabled | `authConfig.enableMagicLink = false` |
| **Admin/Mentor Roles** | ❌ Future-proofed | `requireRole()` exists but throws for any role != 'user' |
| **Audit Log** | ❌ Table only | `audit_events` table in SQL schema; no writes in codebase |
| **Supabase SSR** | ❌ Package installed | `@supabase/ssr` in deps, cookie-based server session not wired to UI |
| **Onboarding Flow** | ❌ Stub | Page exists but no backend; consent flags defined in schema but not captured |

---

## 4. ⚠️ Production Readiness Gaps

| Gap | Severity | Detail |
|---|---|---|
| **Next.js version** | 🔴 High | `next@14.2.x` carries a deprecation advisory — upgrade to 15.x before public pilot |
| **No real auth** | 🔴 High | All API routes call `requireUser()` which will fail without live Supabase session |
| **AI key exposure risk** | 🟡 Medium | `.env.example` correctly says server-side only; but the actual Gemini call stub is not yet guarded end-to-end |
| **`lib/config.ts` serverEnvSchema fails at build** | 🟡 Medium | `serverEnvSchema.parse(process.env)` will throw on Vercel/prod without SUPABASE_URL set |
| **No CSRF protection** | 🟡 Medium | API routes do not validate `Origin` header or CSRF tokens |
| **No input sanitization beyond Zod** | 🟡 Medium | Student text content goes into the mock evaluator verbatim; XSS risk if rendered as `dangerouslySetInnerHTML` (not current, but watch when adding rich text) |
| **Vitest tests** | 🟠 Low-Medium | Test framework configured but no test files found — 0% test coverage |
| **Playwright E2E** | 🟠 Low-Medium | Configured but no spec files found |
| **`uid()` collision risk** | 🟠 Low | `Date.now().toString(36) + random` is not UUID v4 — fine for prototype, not for production |
| **No error boundaries in React** | 🟠 Low | App-level error boundary (`not-found.tsx` exists but no `error.tsx`) |

---

## 5. 🚀 Enhanceable Features — Prioritized Roadmap

### 🔴 P0 — Must Do Before Launch

#### 1. Wire Real Authentication (Supabase Auth)
- Replace `/signin` and `/signup` stubs with real Supabase Auth flows
- Add cookie-based session using `@supabase/ssr` (package already installed)
- Enable email confirmation via Supabase dashboard
- Implement password reset flow (schema already built)

#### 2. Wire Real AI (Gemini 1.5 Flash)
- Implement `generateAiManagerReply()` in `/api/ai/route.ts` (placeholder already there)
- Add prompt template to keep scenario rules separate from student text (security)
- Add exponential backoff + jitter (comment in code already notes this)
- The mock fallback pattern already exists — just fill in the real call

#### 3. Switch Persistence from localStorage → Supabase
- Replace `lib/store.ts` calls in UI with API route calls to `/api/sessions` + `/api/evaluations`
- DB layer (`lib/db/index.ts`) is 100% built — just needs to be called from the UI
- Run `docs/supabase-schema.sql` in Supabase SQL editor to create tables

#### 4. Enable Rate Limiting
- Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in production env
- Rate limiting code is fully complete — just needs credentials

---

### 🟡 P1 — High Value Enhancements

#### 5. Build Remaining 23 Career Simulations
- Only Product Manager is fully built; 23 careers show "Soon"
- Each needs: a `Scenario` object in `lib/scenarios.ts`, task sequence + rubric, ACKS bank in `mockAI.ts`
- Highest-value next ones: Data Analyst, UX Designer, Software Engineer

#### 6. Add Real-Time AI Streaming
- Current: AI reply returns as a single response after a wait
- Enhancement: Stream tokens as they arrive (Next.js `ReadableStream` + `useEffect` reader)
- Makes the "Maya is replying…" animation feel genuinely live

#### 7. Upgrade Next.js to 15.x
- Noted in README as a known issue
- Next.js 15 brings improved server actions, partial prerendering, and better SSR caching

#### 8. Write Tests
- Vitest + Playwright are already configured — no test files exist yet
- Start with: `lib/mockAI.ts` unit tests, `lib/store.ts` unit tests, dashboard render smoke tests

---

### 🟢 P2 — Feature Completions

#### 9. Mentor / Teacher Dashboard
- `profiles.role` supports `'mentor'` — schema and RBAC skeleton already exist
- Mentors could see anonymized student results in aggregate
- Prepares the product for institutional sales (schools, universities)

#### 10. Multi-Language Support (Sinhala / Tamil)
- `profiles.preferred_language` is already in the DB schema
- Student body is Sri Lankan — localisation is a competitive differentiator
- Next.js i18n routing can be added without structural changes

#### 11. Progress Sharing / Export
- Students currently can't share their evaluation results
- Add: PDF export of evaluation, shareable link (public token), LinkedIn badge integration

#### 12. Notification / Reminder System
- Email reminders for abandoned sessions (Supabase Edge Functions + Resend/Postmark)
- "You're 60% through your PM simulation — finish it!" re-engagement loop

#### 13. Leaderboard / Community Features
- Opt-in anonymous skill comparison ("Top 20% in Problem Framing this week")
- `agreed_to_share_results` field is already in the profile schema — just needs the feature

#### 14. Admin Analytics Panel
- Audit events table already in SQL schema
- Track: most-started careers, drop-off points, average scores per rubric criterion
- Wire to a simple chart dashboard for the product team

#### 15. Cohort / Class Mode
- Allow teachers to assign specific simulations to a class
- Students' results aggregate into a class report
- Needs: `cohorts` table, invitation flow, cohort-scoped RLS policies

---

## 6. 📊 Production Readiness Score

| Category | Score | Notes |
|---|---|---|
| Frontend UX/UI | ⭐⭐⭐⭐⭐ | Excellent — responsive, animated, accessible |
| Backend Architecture | ⭐⭐⭐⭐☆ | Extremely well-structured; just needs credentials wired |
| Security | ⭐⭐⭐☆☆ | RLS designed, but auth not live; CSRF not addressed |
| Data Persistence | ⭐⭐☆☆☆ | localStorage only; cross-device = none |
| AI Intelligence | ⭐⭐☆☆☆ | Mock is clever but deterministic; real Gemini not wired |
| Test Coverage | ⭐☆☆☆☆ | 0% — frameworks configured but no test files |
| Documentation | ⭐⭐⭐⭐⭐ | README, SQL schema, setup checklist, type docs — excellent |
| **Overall** | **⭐⭐⭐☆☆** | **Impressive prototype; ~3–4 days of wiring from a real MVP** |

---

## 7. 🧵 Key Architectural Strengths

1. **Intentional layering** — `lib/store.ts` (localStorage) and `lib/db/index.ts` (Supabase) have matching function signatures. Swapping is additive, not a rewrite.
2. **AI fallback pattern** — The API route tries real Gemini → falls back to mock. Zero downtime on AI failure.
3. **RLS-first database design** — Every table has Row Level Security. No user can read another user's data at the DB layer, regardless of API bugs.
4. **Zod at every boundary** — All server inputs are validated with typed schemas before touching the DB.
5. **Secret isolation** — Server-only env vars are explicitly separated from public vars in `lib/config.ts`. Browser bundle can never receive service-role keys.
6. **Structured error hierarchy** — 8 typed error classes with safe serialization (`sanitizeError`) that never leaks internals to clients.
7. **Responsible AI by design** — Evidence-based feedback, no permanent labels, visible limitations note, minimal data collection, clear-my-data control.

---

_Analysis performed: 2026-10-06 | Codebase: HungryBeast-PassionEngine-main_
