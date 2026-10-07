# Gate 3 Execution Plan
## The Passion Discovery Engine — Stability, Wiring & Testing

> **Status check (7 Oct 2026):**
> - ✅ TypeScript: 0 errors
> - ✅ Credentials: Supabase, Upstash Redis, Gemini all set in `.env.local`
> - ✅ DB layer: `lib/db/index.ts` complete
> - ✅ Rate limiting: `lib/rate-limit.ts` complete
> - ✅ Config flags: `aiGatewayEnabled`, `rateLimitEnabled`, `supabaseServerConfigured` all auto-detect from env

---

## What Needs Activating (credentials already exist)

The `.env.local` already contains:
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` → DB + Auth ready
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` → Rate limiting ready
- `GEMINI_API_KEY`, `AI_MODEL=gemini-1.5-flash` → AI ready

The only gaps are **code wiring** — the UI still calls `lib/store.ts` (localStorage) instead of the API routes, the `/api/ai` route still throws (never calls Gemini), and auth pages are stubs.

---

## Phase 1 — ACTIVATE (Day 1)
**Goal: Make everything real. No more mocks where credentials exist.**

### Task 1.1 — Wire Real Gemini AI in `/api/ai/route.ts`
**File:** `app/api/ai/route.ts`  
Replace the `throw new Error('AI provider not wired yet')` placeholder with a real Gemini SDK call.

```typescript
// Install: npm install @google/generative-ai
import { GoogleGenerativeAI } from '@google/generative-ai';
import { aiConfig } from '@/lib/config';

async function generateAiManagerReply(scenario, taskId, answer, turnIndex) {
  if (!aiConfig.enabled) throw new Error('AI provider not wired yet');
  
  const genAI = new GoogleGenerativeAI(aiConfig.apiKey);
  const model = genAI.getGenerativeModel({ model: aiConfig.model });
  
  const task = findTaskForTurn(scenario, taskId);
  const prompt = buildManagerPrompt(scenario, task, answer, turnIndex);
  
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: aiConfig.maxOutputTokens }
  });
  
  return result.response.text();
}

function buildManagerPrompt(scenario, task, answer, turnIndex) {
  return `You are ${scenario.managerName}, ${scenario.managerTitle} at ${scenario.company}.
You are mentoring a student in a career simulation. The student is working on this task:

TASK: ${task.title}
TASK BRIEF: ${task.brief}

The student responded:
"${answer}"

Respond as ${scenario.managerName} would — give realistic, concise feedback (2-3 sentences max).
Be encouraging but honest. React to what they actually said, not generic advice.
Do NOT break character. Do NOT explain you are an AI.`;
}
```

### Task 1.2 — Wire Supabase Auth (Sign Up + Sign In)
**Files:** `app/signup/page.tsx`, `app/signin/page.tsx`

Replace UI stubs with real Supabase Auth calls using `createSupabaseBrowserClient()`.

```typescript
// In signup page:
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

const supabase = createSupabaseBrowserClient();
const { data, error } = await supabase!.auth.signUp({
  email,
  password,
  options: { data: { display_name: name } }
});

// In signin page:
const { data, error } = await supabase!.auth.signInWithPassword({ email, password });
if (data.session) router.push('/dashboard');
```

### Task 1.3 — Deploy SQL Schema to Supabase
Run `docs/supabase-schema.sql` in the Supabase SQL editor for project `vaojdlruetseaaqvhnjo`.

**Tables to verify after running:**
- [ ] `profiles`
- [ ] `simulation_sessions`
- [ ] `simulation_turns`
- [ ] `session_evaluations`
- [ ] `audit_events`

### Task 1.4 — Switch UI from localStorage → API Routes
**Files:** `app/simulate/[slug]/run/page.tsx`, `app/dashboard/page.tsx`, `app/evaluation/[sessionId]/page.tsx`

Replace `import { createSession, listSessions, ... } from '@/lib/store'` with API fetch calls.

```typescript
// Create session
const res = await fetch('/api/sessions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ scenarioSlug, careerSlug })
});
const { session } = await res.json();

// Fetch dashboard data
const res = await fetch('/api/sessions');
const { sessions } = await res.json();
```

---

## Phase 2 — STABILISE (Day 1-2)
**Goal: Fix all known bugs and production safety gaps.**

### Task 2.1 — Fix `uid()` → `crypto.randomUUID()`
**File:** `lib/store.ts`
```typescript
// Replace:
function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
// With:
function uid(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '')}`;
}
```

### Task 2.2 — Add Global React Error Boundary
**File:** `app/error.tsx` (create new)
```typescript
'use client';
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-2xl font-bold text-ink">Something went wrong</h2>
      <p className="text-ink-muted">{error.message}</p>
      <button onClick={reset} className="btn btn-primary">Try again</button>
    </div>
  );
}
```

### Task 2.3 — Add CSRF Origin Check to API Routes
**File:** `lib/csrf.ts` (create new)
```typescript
import { NextRequest } from 'next/server';
import { AppError } from './error';

export function checkOrigin(req: NextRequest) {
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (origin && host && !origin.includes(host)) {
    throw new AppError('forbidden', 'Invalid request origin', 403, 'Forbidden');
  }
}
```
Apply `checkOrigin(req)` at the top of all POST handlers in `/api/ai`, `/api/sessions`, `/api/evaluations`.

### Task 2.4 — Add Auth Middleware for Protected Routes
**File:** `middleware.ts` (create at project root)
```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Protect dashboard and simulate routes
  const { pathname } = request.nextUrl;
  const protectedPaths = ['/dashboard', '/simulate', '/evaluation'];
  const isProtected = protectedPaths.some(p => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Check session cookie
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!supabaseUrl || !supabaseKey) return NextResponse.next();

  const response = NextResponse.next();
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }
  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/simulate/:path*', '/evaluation/:path*'],
};
```

---

## Phase 3 — TEST (Day 2-3)
**Goal: Write tests that prove the application works.**

### Task 3.1 — Create Vitest Config
**File:** `vitest.config.ts` (create/update)
```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') }
  }
});
```

**File:** `test/setup.ts` (create)
```typescript
import '@testing-library/jest-dom';
// Mock localStorage
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  length: 0,
  key: () => null,
};
```

### Task 3.2 — Unit Tests: Mock AI Engine
**File:** `test/unit/mockAI.test.ts`

Test the core evaluation and manager reply logic:
- `generateManagerReply()`: strong/partial/thin quality assessment
- `generateEvaluation()`: rubric scoring, skill levels, evidence extraction
- Signal counting and quality thresholds

### Task 3.3 — Unit Tests: Validation Schemas
**File:** `test/unit/validation.test.ts`

Test all Zod schemas:
- Valid and invalid inputs for `signUpSchema`, `createSessionSchema`, `addTurnSchema`
- Edge cases: empty strings, too-long strings, invalid emails

### Task 3.4 — Unit Tests: Store Layer
**File:** `test/unit/store.test.ts`

Test localStorage persistence:
- `createSession()`, `getSession()`, `listSessions()`
- `saveEvaluation()`, `getEvaluation()`
- `resetAll()` clears both keys

### Task 3.5 — Unit Tests: Error Handling
**File:** `test/unit/error.test.ts`

Test error classes and sanitisation:
- Each error class produces correct `statusCode` and `code`
- `sanitizeError()` never leaks internal messages

### Task 3.6 — E2E Tests: Full Simulation Journey (Playwright)
**File:** `test/e2e/simulation.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test('complete PM simulation end-to-end', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Experience the work')).toBeVisible();

  await page.getByRole('link', { name: 'Explore careers' }).first().click();
  await expect(page).toHaveURL('/careers');

  await page.getByText('Product Manager').click();
  await expect(page).toHaveURL('/careers/product-manager');

  await page.getByRole('link', { name: /start simulation/i }).click();
  // Enter simulation
  await page.getByRole('textbox').fill('I would first look at which users churned and when.');
  await page.getByRole('button', { name: /send/i }).click();
  await expect(page.getByText(/Maya/)).toBeVisible();
});
```

### Task 3.7 — E2E Tests: Dashboard Persistence
**File:** `test/e2e/dashboard.spec.ts`

Test that completed simulations appear in the dashboard and survive page refresh.

---

## Phase 4 — POLISH & DEPLOY (Day 3-4)
**Goal: Production build + deployment.**

### Task 4.1 — Production Build Check
```bash
npm run build
npm run start
```
Verify: no build errors, all routes load, no console errors.

### Task 4.2 — Environment Variable Audit
Confirm all vars needed for production are set:
- [ ] `NEXT_PUBLIC_SUPABASE_URL` ✅
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- [ ] `SUPABASE_SERVICE_ROLE_KEY` ✅
- [ ] `UPSTASH_REDIS_REST_URL` ✅
- [ ] `UPSTASH_REDIS_REST_TOKEN` ✅
- [ ] `GEMINI_API_KEY` ✅
- [ ] `APP_ORIGIN` — must be set to production URL on Vercel

### Task 4.3 — Vercel Deployment
1. Push to GitHub (create repo if needed)
2. Connect to Vercel
3. Add all env vars from `.env.local` to Vercel Environment Variables
4. Deploy → verify production URL works

### Task 4.4 — Supabase Auth Callback URL
In Supabase dashboard → Authentication → URL Configuration:
- Add: `https://your-app.vercel.app/auth/callback`
- Add: `http://localhost:3000/auth/callback`

---

## Summary: Task Order

| # | Task | File(s) | Priority |
|---|---|---|---|
| 1 | Wire Gemini AI | `app/api/ai/route.ts` | 🔴 P0 |
| 2 | Wire Supabase Auth (sign-up/sign-in) | `app/signup/`, `app/signin/` | 🔴 P0 |
| 3 | Deploy SQL schema | Supabase SQL editor | 🔴 P0 |
| 4 | Add auth middleware | `middleware.ts` (new) | 🔴 P0 |
| 5 | Switch UI to API routes | simulate/run, dashboard, evaluation | 🔴 P0 |
| 6 | Add `app/error.tsx` | `app/error.tsx` (new) | 🟡 P1 |
| 7 | Fix `uid()` → `crypto.randomUUID()` | `lib/store.ts` | 🟡 P1 |
| 8 | Add CSRF origin check | `lib/csrf.ts` + all POST routes | 🟡 P1 |
| 9 | Unit tests: mockAI | `test/unit/mockAI.test.ts` | 🟡 P1 |
| 10 | Unit tests: validation | `test/unit/validation.test.ts` | 🟡 P1 |
| 11 | Unit tests: store | `test/unit/store.test.ts` | 🟡 P1 |
| 12 | Unit tests: errors | `test/unit/error.test.ts` | 🟡 P1 |
| 13 | E2E: simulation journey | `test/e2e/simulation.spec.ts` | 🟡 P1 |
| 14 | E2E: dashboard persistence | `test/e2e/dashboard.spec.ts` | 🟡 P1 |
| 15 | Production build check | `npm run build` | 🟢 P2 |
| 16 | Deploy to Vercel | Vercel dashboard | 🟢 P2 |

---

*Gate 3 Plan — Passion Discovery Engine*
*All credentials confirmed in `.env.local` as of 7 October 2026*
