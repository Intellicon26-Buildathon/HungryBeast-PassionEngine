# The Passion Discovery Engine

### Experience the work. Discover yourself.

An AI-powered career exploration platform for Sri Lankan students: instead of
_telling_ you which career to pick, it lets you **step into the job** — solve a
real problem, work with an AI manager, and get evidence-based feedback on what
you actually did.

> **Current status: pre-production beta.** The **Product Manager** simulation
> works end-to-end. Other career cards are concepts, not playable features.
> Production setup and remaining launch blockers are documented in
> [`docs/production-readiness.md`](docs/production-readiness.md).

---

## What works now

Landing → Career catalogue → Career detail → **Virtual Workplace** → AI manager
interaction → Simulation completion → **Evidence-based evaluation** → **Dashboard
(persists across refresh).**

- **Landing page** — value proposition + live workplace preview.
- **Career catalogue** — lists only playable roles. The Product Manager
  simulation is available; concept-only careers stay hidden until implemented.
- **Career detail** — role, mission, manager, task sequence.
- **Simulation prep** — mission briefing before entering.
- **Virtual Workplace** — the hero screen. Looks like a work tool, not a chatbot:
  company header, task rail with live progress, AI manager conversation, response
  box, loading / **retry** / completion states.
- **AI manager** — uses Gemini when configured; development mode has a
  deterministic local fallback.
- **Evaluation** — rubric scores with **evidence quotes from your answers**,
  observed skills (emerging / developing / demonstrated), strengths, areas to
  work on, next steps, and an honest limitations note.
- **Dashboard** — completed simulations, observed skills, saved results that
  survive a page refresh.
- Plus: Supabase-backed email authentication, onboarding, learning resources,
  settings & privacy when the backend is configured.

**Fully responsive** (phone → desktop), keyboard-friendly, with empty / loading /
error states throughout.

---

## Development demo mode

Without backend credentials in development, the app uses browser-local
persistence and deterministic stand-ins from [`lib/mockAI.ts`](lib/mockAI.ts):

| Plan concept        | Prototype stand-in                                   |
| ------------------- | ---------------------------------------------------- |
| Role-play agent     | `generateManagerReply()` — reacts to answer quality + detected themes |
| Evaluation          | `generateEvaluation()` — fixed-rubric scoring + evidence extraction |
| Persistence         | `localStorage` via [`lib/store.ts`](lib/store.ts) |

This mode is for local demonstration only. Production does not fall back to
local data or mock AI when a backend/provider is unavailable.

---

## Run it locally

**Requirements:** Node.js 20.9+.

```bash
npm install
npm run dev        # http://localhost:3000
```

In VS Code, open this project folder, open **Terminal → New Terminal**, and run
the commands above. Then open the URL printed by Next.js; if port 3000 is busy,
Next.js will choose another available port.

Build / production:

```bash
npm run build
npm run start
```

No `.env` is required for local demo mode. `.env.example` lists the backend
variables; production needs Supabase and Gemini configured.

---

## 🚀 Deploying to Vercel

The application can be deployed to **Vercel** after configuring the required services:

### 1. Push & Import
1. Push your repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com/dashboard), click **Add New...** → **Project** and select this repository.
3. Framework preset will automatically be detected as **Next.js**.

### 2. Environment Variables
Local development can run in demo mode without credentials. Production must use
Supabase-backed authentication and persistence. Gemini is required for live
manager replies; if it is unavailable, production returns a service error
instead of substituting a mock response.

When you are ready to enable production backends, configure the following variables in **Vercel Project Settings → Environment Variables**:

| Variable | Description | Required |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Required |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous public key | Required |
| `SUPABASE_URL` | Supabase project URL for privileged server tasks | Only for those tasks |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key (server-only; never expose publicly) | Only for privileged tasks |
| `GEMINI_API_KEY` | Google Gemini key for live manager replies | Required for live AI |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL for distributed AI rate limiting | Required for production AI |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token | Required for production AI |
| `APP_ORIGIN` | Public deployment origin (auto-detected on Vercel if omitted) | Recommended |

> **Note:** Vercel deployment URLs (`*.vercel.app`) are automatically detected for auth callbacks and origins via Vercel system environment variables (`VERCEL_URL` / `VERCEL_PROJECT_PRODUCTION_URL`).

### 3. Vercel Configuration Highlights
- **`vercel.json`**: Pre-configured with Next.js framework settings and `maxDuration: 30` on AI routes to accommodate generative AI completions without edge timeout.
- **Dynamic Handlers**: Dynamic routes explicitly configured with `export const dynamic = 'force-dynamic'` to prevent static pre-rendering pitfalls.

---

## 🛠 Tech stack

- **Next.js 15** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** with a custom design system (see `tailwind.config.ts`)
- Fonts: Plus Jakarta Sans + Fraunces (loaded at runtime)
- Supabase/PostgreSQL in backend mode; browser `localStorage` only in development demo mode

---

##  Project structure

```
app/
  page.tsx                      Landing
  careers/                      Catalogue + detail ([slug])
  simulate/[slug]/              Prep + /run (the Virtual Workplace)
  evaluation/[sessionId]/       Evidence-based evaluation
  dashboard/                    Saved results
  onboarding, signin, signup, resources, settings
components/                     Header, footer, cards, icons, logo, auth shell
lib/
  types.ts                      Domain types (mirror the planned DB schema)
  scenarios.ts                  Career catalogue + the NovaTech PM scenario + rubric
  mockAI.ts                     Role-play + evaluation stand-ins
  store.ts                      localStorage persistence (stands in for Supabase)
```

---

The Supabase API/data layer and server-side Gemini gateway are implemented.
Before public launch, deploy the schema, verify production credentials and
email delivery, close the remaining gaps in the readiness report, and complete
an authenticated end-to-end smoke test.

---

##  Responsible-AI stance (built into the product)

- Feedback is **evidence-based** and tied to a human-written rubric — never a
  permanent judgement ("in this simulation you demonstrated…", not "you are/aren't
  suited to this career").
- A visible limitations note on every evaluation.
- Minimal data collection; a "clear my data" control in Settings.
- Student input is treated as untrusted; the role-play prompt keeps scenario
  rules separate from user text.

---

## Known limitations

- Only the Product Manager simulation is playable; the other career cards are
  not implemented.
- Evaluation uses a fixed, deterministic rubric; it is not an adaptive AI
  assessment.
- The application uses HTTP request/response flows, not realtime subscriptions.
- See [`docs/production-readiness.md`](docs/production-readiness.md) before any
  public deployment.

---

_Built for IntelliCon'26. Practice & reflection — not a diagnosis or a career guarantee._
