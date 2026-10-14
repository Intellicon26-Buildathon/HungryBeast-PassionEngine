import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/supabase/server';
import {
  getSessionById,
  listTurnsBySession,
  getEvaluationBySession,
  saveEvaluationForSession,
  updateSession,
} from '@/lib/db';
import { toClientSession, toClientEvaluation } from '@/lib/db/mappers';
import { generateEvaluation } from '@/lib/mockAI';
import { getScenario, getCareer } from '@/lib/scenarios';
import { logger } from '@/lib/logger';
import {
  AppError,
  NotFoundError,
  ValidationError,
  sanitizeError,
  normalizeError,
} from '@/lib/error';

const log = logger;

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ sessionId: string }> };

/** Fetch the stored evaluation for a session (404 if not evaluated yet). */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { sessionId } = await params;

    const evaluation = await getEvaluationBySession(user.id, sessionId);
    if (!evaluation) throw new NotFoundError('Evaluation', sessionId);

    return NextResponse.json({ ok: true, evaluation: toClientEvaluation(evaluation) });
  } catch (err) {
    return errorResponse(err);
  }
}

/**
 * Finish a session: score the persisted transcript server-side, store the
 * evaluation and mark the session completed. Idempotent — calling it again
 * returns the evaluation that already exists.
 */
export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { sessionId } = await params;

    const existing = await getEvaluationBySession(user.id, sessionId);
    if (existing) {
      return NextResponse.json({ ok: true, evaluation: toClientEvaluation(existing) });
    }

    const session = await getSessionById(user.id, sessionId);
    const scenario = getScenario(session.scenario_slug);
    if (!scenario) throw new NotFoundError('Scenario', session.scenario_slug);
    const careerTitle = getCareer(session.career_slug)?.title ?? scenario.role;

    const turns = await listTurnsBySession(user.id, sessionId);
    if (!turns.some((t) => t.speaker === 'student')) {
      throw new ValidationError('Answer at least one task before finishing.');
    }

    // Scored from what is stored, never from what the client sends.
    const ev = generateEvaluation(scenario, toClientSession(session, turns), careerTitle);

    const saved = await saveEvaluationForSession(user, sessionId, {
      scenario_slug: ev.scenarioSlug,
      career_title: ev.careerTitle,
      summary: ev.summary,
      criteria: ev.criteria as unknown as Record<string, unknown>[],
      observed_skills: ev.observedSkills as unknown as Record<string, unknown>[],
      strengths: ev.strengths,
      improvements: ev.improvements,
      next_steps: ev.nextSteps,
      limitations: ev.limitations,
    });

    if (session.status !== 'completed') {
      const now = new Date().toISOString();
      await updateSession(user.id, sessionId, {
        status: 'completed',
        completed_at: now,
        updated_at: now,
      });
    }

    log.info({ userId: user.id, sessionId }, 'Session evaluated');

    return NextResponse.json({ ok: true, evaluation: toClientEvaluation(saved) });
  } catch (err) {
    return errorResponse(err);
  }
}

function errorResponse(err: unknown) {
  err = normalizeError(err);
  if (err instanceof AppError) {
    return NextResponse.json(err.toJSON(), { status: err.statusCode });
  }
  log.error({ err }, 'Evaluation API failed');
  return NextResponse.json(sanitizeError(err), { status: 500 });
}
