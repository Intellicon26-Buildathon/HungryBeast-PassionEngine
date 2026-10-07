import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/supabase/server';
import { getSessionById, updateSession } from '@/lib/db';
import { getSessionSchema, completeSessionSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { NotFoundError, ValidationError, ForbiddenError, AppError, sanitizeError } from '@/lib/error';

const log = logger;

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const user = await requireUser();
    const { sessionId } = await params;

    const session = await getSessionById(user.id, sessionId);

    return NextResponse.json({
      ok: true,
      session: {
        id: session.id,
        scenarioSlug: session.scenario_slug,
        careerSlug: session.career_slug,
        status: session.status,
        currentTaskIndex: session.current_task_index,
        turns: [],
        startedAt: session.started_at,
        completedAt: session.completed_at,
      },
    });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode });
    }
    logError(err);
    return NextResponse.json(sanitizeError(err), { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const user = await requireUser();
    const { sessionId } = await params;

    const body = await request.json().catch(() => ({}));
    const input = completeSessionSchema.parse(body);

    const session = await getSessionById(user.id, sessionId);

    const updated = await updateSession(user.id, sessionId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });

    log.info({ userId: user.id, sessionId, beforeStatus: session.status }, 'Session completed');

    return NextResponse.json({
      ok: true,
      session: {
        id: updated.id,
        scenarioSlug: updated.scenario_slug,
        careerSlug: updated.career_slug,
        status: updated.status,
        currentTaskIndex: updated.current_task_index,
        turns: [],
        startedAt: updated.started_at,
        completedAt: updated.completed_at,
      },
    });
  } catch (err) {
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
