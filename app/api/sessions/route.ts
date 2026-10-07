import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/supabase/server';
import { createSessionForUser, listSessionsByUser } from '@/lib/db';
import { createSessionSchema, listSessionsSchema } from '@/lib/validation';
import { getScenario } from '@/lib/scenarios';
import { logger } from '@/lib/logger';
import { NotFoundError, ValidationError, ForbiddenError, AppError, sanitizeError } from '@/lib/error';

const log = logger;

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();

    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Number(searchParams.get('limit')) || 50);
    const cursor = searchParams.get('cursor') ?? undefined;

    const sessions = await listSessionsByUser(user.id, { limit, cursor });

    return NextResponse.json({
      ok: true,
      sessions: sessions.map((s) => ({
        id: s.id,
        scenarioSlug: s.scenario_slug,
        careerSlug: s.career_slug,
        status: s.status,
        currentTaskIndex: s.current_task_index,
        turns: [],
        startedAt: s.started_at,
        completedAt: s.completed_at,
      })),
    });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode });
    }
    logError(err);
    return NextResponse.json(sanitizeError(err), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    const body = await req.json().catch(() => ({}));
    const input = createSessionSchema.parse(body);

    const scenario = getScenario(input.scenarioSlug);
    if (!scenario) {
      throw new NotFoundError('Simulation', input.scenarioSlug);
    }

    // Future quota gate: per-user daily simulation limit.
    // For now this is a placeholder that can be tightened at pilot.
    await checkSimulationQuota(user.id);

    const session = await createSessionForUser(user, input);

    log.info({ userId: user.id, sessionId: session.id, scenarioSlug: input.scenarioSlug }, 'Session created');

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

async function checkSimulationQuota(userId: string) {
  // Placeholder for the per-user daily simulation quota.
  // During beta this should be generous or disabled; at public pilot it becomes
  // the 5 simulations/day rule described in the spec.
  return;
}

function logError(err: unknown) {
  if (err && typeof err === 'object' && 'message' in err) {
    log.warn({ err }, 'Sessions API failed');
  } else {
    log.error({ err }, 'Sessions API failed');
  }
}
