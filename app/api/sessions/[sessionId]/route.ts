import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/supabase/server';
import { getSessionById, listTurnsBySession, updateSession } from '@/lib/db';
import { toClientSession } from '@/lib/db/mappers';
import { updateSessionSchema } from '@/lib/validation';
import { getScenario } from '@/lib/scenarios';
import { logger } from '@/lib/logger';
import { AppError, ValidationError, sanitizeError, normalizeError } from '@/lib/error';
import type { SimulationSession } from '@/lib/db/schema';

const log = logger;

export const dynamic = 'force-dynamic';

/** Session detail, including its full turn history. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const user = await requireUser();
    const { sessionId } = await params;

    const session = await getSessionById(user.id, sessionId);
    const turns = await listTurnsBySession(user.id, sessionId);

    return NextResponse.json({ ok: true, session: toClientSession(session, turns) });
  } catch (err) {
    err = normalizeError(err);
    if (err instanceof AppError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode });
    }
    logError(err);
    return NextResponse.json(sanitizeError(err), { status: 500 });
  }
}

/** Advance the task pointer and/or change status (e.g. abandon). */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const user = await requireUser();
    const { sessionId } = await params;

    const body = await request.json().catch(() => ({}));
    const input = updateSessionSchema.parse(body);

    const session = await getSessionById(user.id, sessionId);

    const updates: Partial<SimulationSession> = { updated_at: new Date().toISOString() };

    if (input.currentTaskIndex !== undefined) {
      const scenario = getScenario(session.scenario_slug);
      const max = scenario ? scenario.tasks.length - 1 : 0;
      if (input.currentTaskIndex > max) {
        throw new ValidationError('Task index is out of range for this simulation.');
      }
      updates.current_task_index = input.currentTaskIndex;
    }
    if (input.status !== undefined) {
      updates.status = input.status;
      updates.completed_at = input.status === 'completed' ? new Date().toISOString() : null;
    }

    const updated = await updateSession(user.id, sessionId, updates);

    log.info({ userId: user.id, sessionId, input }, 'Session updated');

    return NextResponse.json({ ok: true, session: toClientSession(updated) });
  } catch (err) {
    err = normalizeError(err);
    if (err instanceof AppError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode });
    }
    logError(err);
    return NextResponse.json(sanitizeError(err), { status: 500 });
  }
}

function logError(err: unknown) {
  if (err && typeof err === 'object' && 'message' in err) {
    log.warn({ err }, 'Session detail API failed');
  } else {
    log.error({ err }, 'Session detail API failed');
  }
}
