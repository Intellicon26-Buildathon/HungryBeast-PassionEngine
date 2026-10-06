# The Passion Discovery Engine

### Experience the work. Discover yourself.

An AI-powered career exploration platform for Sri Lankan students: instead of
_telling_ you which career to pick, it lets you **step into the job** — solve a
real problem, work with an AI manager, and get evidence-based feedback on what
you actually did.

> **IntelliCon'26 — Gate 2 prototype.** This is a working vertical slice, not the
> finished platform. The **Product Manager** simulation is fully playable
> end-to-end; the other careers are concept cards marked “Soon” in the catalogue.

---

##  What works right now (the Gate 2 vertical slice)

Landing → Career catalogue → Career detail → **Virtual Workplace** → AI manager
interaction → Simulation completion → **Evidence-based evaluation** → **Dashboard
(persists across refresh).**

- **Landing page** — value proposition + live workplace preview.
- **Career catalogue** — 24 role cards across technology, design, and business,
  with area filters. Product Manager is live; the other roles are marked “Soon.”
- **Career detail** — role, mission, manager, task sequence.
- **Simulation prep** — mission briefing before entering.
- **Virtual Workplace** — the hero screen. Looks like a work tool, not a chatbot:
  company header, task rail with live progress, AI manager conversation, response
  box, loading / **retry** / completion states.
- **AI manager** — responds to what you actually write (see _Mock AI_ below).
- **Evaluation** — rubric scores with **evidence quotes from your answers**,
  observed skills (emerging / developing / demonstrated), strengths, areas to
  work on, next steps, and an honest limitations note.
- **Dashboard** — completed simulations, observed skills, saved results that
  survive a page refresh.
- Plus: onboarding, sign-in/up stubs, learning resources, settings & privacy.

**Fully responsive** (phone → desktop), keyboard-friendly, with empty / loading /
error states throughout.

---

##  The "AI" today: a built-in mock (zero keys needed)

So the whole flow is demonstrable **with no API keys and no database**, the two
bounded AI agents from the plan are implemented as deterministic, client-side
functions in [`lib/mockAI.ts`](lib/mockAI.ts):

| Plan concept        | Prototype stand-in                                   |
| ------------------- | ---------------------------------------------------- |
| Role-play agent     | `generateManagerReply()` — reacts to answer quality + detected themes |
| Evaluation agent    | `generateEvaluation()` — rubric scoring + evidence extraction |
| Database tables     | `localStorage` via [`lib/store.ts`](lib/store.ts)    |

These return the **exact same shapes** a real backend will, so wiring in real
Gemini + Supabase later is a drop-in with **no UI changes** (see below).

---

## Run it locally

**Requirements:** Node.js 18.17+ (LTS recommended).

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

No `.env` is required for the prototype. `.env.example` lists the variables the
real backend will use.

---

## 🛠 Tech stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** with a custom design system (see `tailwind.config.ts`)
- Fonts: Plus Jakarta Sans + Fraunces (loaded at runtime)
- Browser `localStorage` for prototype persistence

Chosen to match the plan's stack so Supabase + Gemini slot in cleanly.

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

## Wiring in real Gemini + Supabase (next step)

The code is structured so this is additive, not a rewrite:

1. **AI (server-side only):** add a route handler (e.g. `app/api/turn/route.ts`)
   that calls Gemini with the prompt template from the plan, validates the JSON
   against the evaluation schema, and returns the same shape `mockAI.ts` returns.
   Point the workspace at it instead of the mock. **Never expose the Gemini key
   in the browser** — all calls stay server-side.
2. **Database:** replace the `lib/store.ts` functions with Supabase queries
   (`simulation_sessions`, `simulation_turns`, `session_evaluations`). The function
   names and return types already match.
3. **Auth:** swap the sign-in/up stubs for Supabase Auth; enable RLS so students
   only read their own sessions.

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

##  Known limitations (Gate 2)

- AI responses are a deterministic mock until Gemini is wired in.
- Persistence is browser-local (per device) until Supabase is wired in.
- Only the Product Manager simulation is fully built.
- `next@14.2.x` carries a deprecation advisory; upgrade before a public pilot.

---

_Built for IntelliCon'26. Practice & reflection — not a diagnosis or a career guarantee._
