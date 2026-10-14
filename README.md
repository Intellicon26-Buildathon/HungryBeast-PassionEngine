# The Passion Discovery Engine

### Experience the work. Discover yourself.

An AI-powered career exploration platform for Sri Lankan students: instead of
_telling_ you which career to pick, it lets you **step into the job** — solve a
real problem, work with an AI manager, and get evidence-based feedback on what
you actually did.

> **Current status: pre-production beta.** All 24 listed career roles now have
> role-specific fictional workplace simulations, task rubrics, and saved-answer
> reports. Live Gemini and production backend services still need credentials.
> Remaining launch blockers are documented in
> [`docs/production-readiness.md`](docs/production-readiness.md).

---

## What works now

Landing → Career catalogue → Career detail → **Virtual Workplace** → AI manager
interaction → Simulation completion → **Evidence-based evaluation** → **Dashboard
(persists across refresh).**

- **Landing page** — value proposition + live workplace preview.
- **Career catalogue** — 24 playable roles across software, data, design,
  security, operations, and business.
- **Career detail** — role-specific mission, fictional case context, typical
  work, deliverables, collaborators, trade-offs, and task sequence.
- **Simulation prep** — mission briefing before entering.
- **Virtual Workplace** — the hero screen. Looks like a work tool, not a chatbot:
  company header, task rail with live progress, AI manager conversation, response
  box, loading / **retry** / completion states.
- **AI manager** — sends responses to Gemini when `GEMINI_API_KEY` is set. The
  workplace shows whether Gemini is configured or local practice replies are
  being used. A configured Gemini failure is shown instead of silently
  switching to a mock reply.
- **Evaluation** — rubric scores with **evidence quotes from your answers**,
  a skill-evidence infographic, role insights, observed skills (emerging /
  developing / demonstrated), strengths, areas to practise, and next steps.
  Reports can be printed or saved as PDF.
- **Dashboard** — completed simulations, observed skills, saved results that
  survive a page refresh.
- Plus: Supabase-backed email authentication, onboarding, learning resources,
  settings & privacy when the backend is configured.

**Fully responsive** (phone → desktop), keyboard-friendly, with empty / loading /
error states throughout.

---

## Development demo mode

Without Supabase credentials, development uses browser-local persistence.
Without a Gemini key, manager messages use clearly labelled deterministic
practice replies from [`lib/mockAI.ts`](lib/mockAI.ts). To enable live Gemini
locally:

1. Copy `.env.example` to `.env.local`.
2. Set `GEMINI_API_KEY` to a key from Google AI Studio.
3. Keep `AI_MODEL=gemini-2.5-flash`, unless you have verified another model.
4. Restart `npm run dev`; the workplace should report **Gemini configured**.

The key stays server-side. The local-only `/api/ai/demo` route is disabled
outside development. If a configured key or model fails, the app reports the
provider error instead of disguising it as a successful Gemini reply.

| Plan concept        | Prototype stand-in                                   |
| ------------------- | ---------------------------------------------------- |
| Role-play agent     | `generateManagerReply()` — reacts to answer quality + detected themes |
| Evaluation          | `generateEvaluation()` — fixed-rubric scoring + evidence extraction |
| Persistence         | `localStorage` via [`lib/store.ts`](lib/store.ts) |

Browser-local persistence and practice replies are for local demonstration
only. Production does not fall back to local data or mock AI when a
backend/provider is unavailable.

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

No `.env` is required for local practice mode. `.env.example` lists the
variables; live Gemini needs `GEMINI_API_KEY`, while production also needs
Supabase, Upstash, and the deployment settings below.

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
scenarios.ts                  Career catalogue, authored case studies and rubrics
mockAI.ts                     Practice replies + evidence-based evaluation
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

- Career case content and rubrics are currently source-controlled, not managed
  through an in-app editor or realtime content service.
- Scenarios use fictional organisations and workplace details for practice;
  they are not live placements or claims about specific employers.
- Evaluation uses a fixed, deterministic, role-specific rubric; it is not an
  adaptive AI assessment or a career-fit diagnosis.
- Gemini cannot run in this checkout until a valid `GEMINI_API_KEY` is added
  to `.env.local` or the Vercel environment.
- The application uses HTTP request/response flows, not realtime subscriptions.
- See [`docs/production-readiness.md`](docs/production-readiness.md) before any
  public deployment.

---

_Built for IntelliCon'26. Practice & reflection — not a diagnosis or a career guarantee._
