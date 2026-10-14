import type { Session, Turn, Evaluation, CriterionScore, ObservedSkill } from '../types';
import type { SimulationSession, SimulationTurn, SessionEvaluation } from './schema';

// ---------------------------------------------------------------------------
// Row → client shape mappers
// ---------------------------------------------------------------------------
// Supabase rows are snake_case with ISO timestamps; the UI types in
// lib/types.ts are camelCase with epoch-millis. Every API route returns the
// client shape so the browser never has to know about the DB layout.
// ---------------------------------------------------------------------------

const ms = (iso: string | null | undefined) => (iso ? Date.parse(iso) || 0 : undefined);

export function toClientTurn(t: SimulationTurn, index: number): Turn {
  return {
    id: t.id,
    index,
    speaker: t.speaker,
    content: t.content,
    taskId: t.task_id ?? undefined,
    at: ms(t.created_at) ?? 0,
  };
}

export function toClientSession(s: SimulationSession, turns: SimulationTurn[] = []): Session {
  return {
    id: s.id,
    scenarioSlug: s.scenario_slug,
    careerSlug: s.career_slug,
    status: s.status,
    currentTaskIndex: s.current_task_index,
    turns: turns.map(toClientTurn),
    startedAt: ms(s.started_at) ?? 0,
    completedAt: ms(s.completed_at),
  };
}

export function toClientEvaluation(e: SessionEvaluation): Evaluation {
  return {
    sessionId: e.session_id,
    scenarioSlug: e.scenario_slug,
    careerTitle: e.career_title,
    summary: e.summary,
    criteria: (e.criteria ?? []) as unknown as CriterionScore[],
    observedSkills: (e.observed_skills ?? []) as unknown as ObservedSkill[],
    strengths: e.strengths ?? [],
    improvements: e.improvements ?? [],
    nextSteps: e.next_steps ?? [],
    limitations: e.limitations ?? '',
    createdAt: ms(e.created_at) ?? 0,
  };
}
