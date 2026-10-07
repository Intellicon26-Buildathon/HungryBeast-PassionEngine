import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/supabase/server';
import { listEvaluationsByUser } from '@/lib/db';
import { logger } from '@/lib/logger';
import { AppError, sanitizeError } from '@/lib/error';

const log = logger;

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();

    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Number(searchParams.get('limit')) || 50);
    const cursor = searchParams.get('cursor') ?? undefined;

    const evals = await listEvaluationsByUser(user.id, { limit, cursor });

    return NextResponse.json({
      ok: true,
      evaluations: evals.map((e) => ({
        sessionId: e.session_id,
        scenarioSlug: e.scenario_slug,
        careerTitle: e.career_title,
        summary: e.summary,
        strengths: e.strengths,
        improvements: e.improvements,
        nextSteps: e.next_steps,
        limitations: e.limitations,
        createdAt: e.created_at,
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

function logError(err: unknown) {
  if (err && typeof err === 'object' && 'message' in err) {
    log.warn({ err }, 'Evaluations API failed');
  } else {
    log.error({ err }, 'Evaluations API failed');
  }
}
