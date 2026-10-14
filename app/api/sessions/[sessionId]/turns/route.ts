import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/supabase/server';
import { addTurnToSession, listTurnsBySession, getSessionById } from '@/lib/db';
import { addTurnSchema } from '@/lib/validation';
import { toClientTurn } from '@/lib/db/mappers';
import { logger } from '@/lib/logger';
import { NotFoundError, ValidationError, ForbiddenError, AppError, sanitizeError, normalizeError } from '@/lib/error';

const log = logger;

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const user = await requireUser();
    const { sessionId } = await params;

    await getSessionById(user.id, sessionId);
    const turns = await listTurnsBySession(user.id, sessionId);

    return NextResponse.json({ ok: true, turns: turns.map(toClientTurn) });
  } catch (err) {
    err = normalizeError(err);
    if (err instanceof AppError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode });
    }
    logError(err);
    return NextResponse.json(sanitizeError(err), { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const user = await requireUser();
    const { sessionId } = await params;

    // Ensure session exists and belongs to the user before adding a turn.
    await getSessionById(user.id, sessionId);

    const body = await request.json().catch(() => ({}));
    const input = addTurnSchema.parse({ ...body, sessionId });

    const turn = await addTurnToSession(user.id, {
      ...input,
      sessionId,
    });
    // Ordinal position = how many turns precede it.
    const index = (await listTurnsBySession(user.id, sessionId)).length - 1;

    log.info({ userId: user.id, sessionId, turnId: turn.id, speaker: turn.speaker }, 'Turn saved');

    return NextResponse.json({
      ok: true,
      turn: toClientTurn(turn, index),
    });
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
    log.warn({ err }, 'Turns API failed');
  } else {
    log.error({ err }, 'Turns API failed');
  }
}
