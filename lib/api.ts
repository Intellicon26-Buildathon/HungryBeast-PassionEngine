"use client";

import * as local from "./store";
import { isSupabaseBrowserConfigured } from "./supabase/client";
import { generateManagerReply, generateEvaluation } from "./mockAI";
import type { Evaluation, Scenario, ScenarioTask, Session, Speaker, Turn } from "./types";

// ---------------------------------------------------------------------------
// Client data layer
// ---------------------------------------------------------------------------
// The single place UI code goes for sessions, turns, evaluations and auth.
//
//   • Backend mode (Supabase configured): every call hits the Next.js API
//     routes, which authenticate via the auth cookie and persist to Postgres.
//   • Prototype mode (no Supabase env): falls back to the browser-local store
//     and the deterministic mock AI, so the demo still runs with zero setup.
//
// Pages never import lib/store directly any more.
// ---------------------------------------------------------------------------

export const backendEnabled = isSupabaseBrowserConfigured;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const isUnauthorized = (err: unknown) => err instanceof ApiError && err.status === 401;

/** Send the user to sign in, then bring them back to where they were. */
export function redirectToSignIn() {
  const next = window.location.pathname + window.location.search;
  window.location.assign(`/signin?next=${encodeURIComponent(next)}`);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      credentials: "same-origin",
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0);
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok || body?.ok === false) {
    // Routes answer either { error: { code, message } } or { code, message }.
    const e = body?.error ?? body ?? {};
    throw new ApiError(e.message || `Request failed (${res.status})`, res.status, e.code);
  }
  return body as T;
}

const json = (data: unknown) => JSON.stringify(data);

// ── Auth ────────────────────────────────────────────────────────────

export interface AuthUserInfo {
  id: string;
  email: string | null;
}

export async function signIn(email: string, password: string): Promise<AuthUserInfo> {
  const { user } = await request<{ user: AuthUserInfo }>("/auth/signin", {
    method: "POST",
    body: json({ email, password }),
  });
  return user;
}

export async function signUp(
  displayName: string,
  email: string,
  password: string
): Promise<{ user: AuthUserInfo; requiresConfirmation: boolean }> {
  return request("/auth/signup", {
    method: "POST",
    body: json({ displayName, email, password }),
  });
}

export async function signOut(): Promise<void> {
  await request("/auth/signout", { method: "POST" });
}

// ── Sessions ────────────────────────────────────────────────────────

export async function listSessions(): Promise<Session[]> {
  if (!backendEnabled) return local.listSessions();
  const { sessions } = await request<{ sessions: Session[] }>("/api/sessions");
  return sessions;
}

/** Session with its full turn history, or null if it doesn't exist / isn't yours. */
export async function getSession(id: string): Promise<Session | null> {
  if (!backendEnabled) return local.getSession(id) ?? null;
  try {
    const { session } = await request<{ session: Session }>(
      `/api/sessions/${encodeURIComponent(id)}`
    );
    return session;
  } catch (err) {
    // A malformed or foreign id is just "not found" from the UI's view.
    if (err instanceof ApiError && (err.status === 404 || err.status === 400)) return null;
    throw err;
  }
}

export async function createSession(scenarioSlug: string, careerSlug: string): Promise<Session> {
  if (!backendEnabled) return local.createSession(scenarioSlug, careerSlug);
  const { session } = await request<{ session: Session }>("/api/sessions", {
    method: "POST",
    body: json({ scenarioSlug, careerSlug }),
  });
  return session;
}

/** Append a turn and return the session with it included. */
export async function addTurn(
  session: Session,
  speaker: Speaker,
  content: string,
  taskId?: string
): Promise<Session> {
  if (!backendEnabled) return local.addTurn(session, speaker, content, taskId);
  const { turn } = await request<{ turn: Turn }>(
    `/api/sessions/${encodeURIComponent(session.id)}/turns`,
    { method: "POST", body: json({ speaker, content, taskId }) }
  );
  return { ...session, turns: [...session.turns, turn] };
}

export async function setCurrentTask(session: Session, index: number): Promise<Session> {
  if (!backendEnabled) {
    const updated = { ...session, currentTaskIndex: index };
    local.saveSession(updated);
    return updated;
  }
  await request(`/api/sessions/${encodeURIComponent(session.id)}`, {
    method: "PATCH",
    body: json({ currentTaskIndex: index }),
  });
  return { ...session, currentTaskIndex: index };
}

/**
 * Ask the AI manager to respond to the latest student answer. The backend
 * persists the reply itself; locally the mock writes it to the store.
 */
export async function requestManagerReply(
  session: Session,
  scenario: Scenario,
  task: ScenarioTask,
  answer: string
): Promise<Session> {
  if (!backendEnabled) {
    // Simulated latency so the typing indicator reads naturally.
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 600));
    const reply = generateManagerReply(scenario, task, answer, session.turns.length);
    return local.addTurn(session, "manager", reply, task.id);
  }
  const { turn } = await request<{ turn: Turn }>("/api/ai", {
    method: "POST",
    body: json({
      sessionId: session.id,
      scenarioSlug: scenario.slug,
      taskId: task.id,
      lastStudentAnswer: answer,
    }),
  });
  return { ...session, turns: [...session.turns, turn] };
}

/** Complete the session and produce its evaluation (idempotent on the server). */
export async function finishSession(
  session: Session,
  scenario: Scenario,
  careerTitle: string
): Promise<Evaluation> {
  if (!backendEnabled) {
    await new Promise((r) => setTimeout(r, 1200));
    const s = local.getSession(session.id) ?? session;
    const done: Session = { ...s, status: "completed", completedAt: Date.now() };
    local.saveSession(done);
    const ev = generateEvaluation(scenario, done, careerTitle);
    local.saveEvaluation(ev);
    return ev;
  }
  const { evaluation } = await request<{ evaluation: Evaluation }>(
    `/api/sessions/${encodeURIComponent(session.id)}/evaluation`,
    { method: "POST" }
  );
  return evaluation;
}

// ── Evaluations ─────────────────────────────────────────────────────

export async function getEvaluation(sessionId: string): Promise<Evaluation | null> {
  if (!backendEnabled) return local.getEvaluation(sessionId) ?? null;
  try {
    const { evaluation } = await request<{ evaluation: Evaluation }>(
      `/api/sessions/${encodeURIComponent(sessionId)}/evaluation`
    );
    return evaluation;
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 400)) return null;
    throw err;
  }
}

export async function listEvaluations(): Promise<Evaluation[]> {
  if (!backendEnabled) return local.listEvaluations();
  const { evaluations } = await request<{ evaluations: Evaluation[] }>("/api/evaluations");
  return evaluations;
}

// ── Profile & data controls ─────────────────────────────────────────

export interface ProfileInfo {
  displayName: string;
  email: string | null;
  district: string;
  preferredLanguage: string;
  agreedToResearch: boolean;
  agreedToShare: boolean;
}

export async function getProfile(): Promise<ProfileInfo> {
  const { profile } = await request<{ profile: ProfileInfo }>("/api/profile");
  return profile;
}

export async function updateProfile(
  patch: Partial<Omit<ProfileInfo, "email">>
): Promise<ProfileInfo> {
  const { profile } = await request<{ profile: ProfileInfo }>("/api/profile", {
    method: "PATCH",
    body: json(patch),
  });
  return profile;
}

/** Delete every session + evaluation the user has. */
export async function clearAllData(): Promise<void> {
  if (!backendEnabled) return local.resetAll();
  await request("/api/sessions", { method: "DELETE" });
}
