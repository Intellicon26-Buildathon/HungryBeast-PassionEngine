"use client";

import type { Session, Evaluation, Turn, Speaker } from "./types";

// Client-side persistence via localStorage. This stands in for the
// Supabase tables (simulation_sessions, simulation_turns, session_evaluations).
// It survives refresh, which is what the Gate 2 dashboard needs to prove.
// Swapping to Supabase later means replacing these functions with API calls.

const SESSIONS_KEY = "pde.sessions.v1";
const EVALS_KEY = "pde.evaluations.v1";

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event("pde:store"));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

// ── Sessions ────────────────────────────────────────────────────────

export function listSessions(): Session[] {
  return safeRead<Session[]>(SESSIONS_KEY, []);
}

export function getSession(id: string): Session | undefined {
  return listSessions().find((s) => s.id === id);
}

export function createSession(scenarioSlug: string, careerSlug: string): Session {
  const session: Session = {
    id: uid("sess"),
    scenarioSlug,
    careerSlug,
    status: "active",
    currentTaskIndex: 0,
    turns: [],
    startedAt: Date.now(),
  };
  const all = listSessions();
  all.unshift(session);
  safeWrite(SESSIONS_KEY, all);
  return session;
}

export function saveSession(session: Session) {
  const all = listSessions();
  const i = all.findIndex((s) => s.id === session.id);
  if (i >= 0) all[i] = session;
  else all.unshift(session);
  safeWrite(SESSIONS_KEY, all);
}

export function addTurn(
  session: Session,
  speaker: Speaker,
  content: string,
  taskId?: string
): Session {
  const turn: Turn = {
    id: uid("turn"),
    index: session.turns.length,
    speaker,
    content,
    taskId,
    at: Date.now(),
  };
  const updated: Session = { ...session, turns: [...session.turns, turn] };
  saveSession(updated);
  return updated;
}

// ── Evaluations ─────────────────────────────────────────────────────

export function listEvaluations(): Evaluation[] {
  return safeRead<Evaluation[]>(EVALS_KEY, []);
}

export function getEvaluation(sessionId: string): Evaluation | undefined {
  return listEvaluations().find((e) => e.sessionId === sessionId);
}

export function saveEvaluation(ev: Evaluation) {
  const all = listEvaluations().filter((e) => e.sessionId !== ev.sessionId);
  all.unshift(ev);
  safeWrite(EVALS_KEY, all);
}

export function resetAll() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSIONS_KEY);
  window.localStorage.removeItem(EVALS_KEY);
  window.dispatchEvent(new Event("pde:store"));
}
