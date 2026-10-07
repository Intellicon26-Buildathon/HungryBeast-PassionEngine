import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/supabase/server';
import { addTurnToSession, listTurnsBySession, getSessionById } from '@/lib/db';
import { addTurnSchema } from '@/lib/validation';
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

    await getSessionById(user.id, sessionId);
    const turns = await listTurnsBySession(user.id, sessionId);

    // `index` is the ordinal position of the turn (Turn.index is a number);
    // `at` is epoch millis to match the client's Turn shape.
    return NextResponse.json({
      ok: true,
      turns: turns.map((t, i) => ({
        id: t.id,
        index: i,
        speaker: t.speaker,
        content: t.content,
        taskId: t.task_id,
        at: Date.parse(t.created_at) || 0,
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
    const input = addTurnSchema.parse(body);

    const turn = await addTurnToSession(user.id, {
      ...input,
      sessionId,
    });

    log.info({ userId: user.id, sessionId, turnId: turn.id, speaker: turn.speaker }, 'Turn saved');

    return NextResponse.json({
      ok: true,
      turn: {
        id: turn.id,
        index: Number(turn.created_at) || 0,
        speaker: turn.speaker,
        content: turn.content,
        taskId: turn.task_id,
        at: Date.parse(turn.created_at) || 0,
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
    log.warn({ err }, 'Turns API failed');
  } else {
    log.error({ err }, 'Turns API failed');
  }
}
