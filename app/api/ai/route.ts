import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/supabase/server';
import { enforceRateLimit } from '@/lib/rate-limit';
import { getSessionById, listTurnsBySession } from '@/lib/db';
import { generateManagerReply } from '@/lib/mockAI';
import { generateManagerReplyViaGemini } from '@/lib/ai/gemini';
import { getScenario } from '@/lib/scenarios';
import { logger } from '@/lib/logger';
import { NotFoundError, AppError, ValidationError, sanitizeError } from '@/lib/error';

const log = logger;

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// ---------------------------------------------------------------------------
// AI gateway route (role-play agent)
// ---------------------------------------------------------------------------
// Order of operations is deliberate:
//   1. Authenticate (JWT from auth cookies).
//   2. Validate the request against the known scenario + session.
//   3. Rate-limit (Upstash) — before any paid model call.
//   4. Call Gemini via the bounded gateway; on any failure fall back to the
//      deterministic mock so an in-progress session never breaks.
// The AI provider key never leaves the server.
// ---------------------------------------------------------------------------

const AI_GLOBAL_SCOPE = 'ai-global';
const AI_PER_USER_SCOPE = 'ai-user';

// Provider protection: a small global ceiling plus a per-user ceiling.
const AI_GLOBAL_POINTS = 30;
const AI_GLOBAL_WINDOW_SECONDS = 60;

const AI_PER_USER_POINTS = 15;
const AI_PER_USER_WINDOW_SECONDS = 60;

interface AiReplyRequest {
  sessionId: string;
  scenarioSlug: string;
  taskId?: string;
  lastStudentAnswer?: string;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    const body = await req.json().catch(() => ({}));
    const input: AiReplyRequest = {
      sessionId: typeof body.sessionId === 'string' ? body.sessionId : '',
      scenarioSlug: typeof body.scenarioSlug === 'string' ? body.scenarioSlug : '',
      taskId: typeof body.taskId === 'string' ? body.taskId : undefined,
      lastStudentAnswer:
        typeof body.lastStudentAnswer === 'string' ? body.lastStudentAnswer : undefined,
    };

    if (!input.sessionId || !input.scenarioSlug) {
      throw new ValidationError('sessionId and scenarioSlug are required');
    }

    const scenario = getScenario(input.scenarioSlug);
    if (!scenario) {
      throw new NotFoundError('Scenario', input.scenarioSlug);
    }

    // Session must exist and belong to the caller.
    const session = await getSessionById(user.id, input.sessionId);

    // The latest student answer from persisted history wins over what the
    // client claims, so replies always respond to stored evidence.
    const turns = await listTurnsBySession(user.id, input.sessionId);
    const studentTurns = turns.filter((t) => t.speaker === 'student');
    const lastAnswer =
      studentTurns.length > 0
        ? studentTurns[studentTurns.length - 1].content
        : (input.lastStudentAnswer ?? '');

    if (!lastAnswer.trim()) {
      throw new ValidationError('No student answer to respond to.');
    }

    // Rate limiting happens before any AI work.
    await enforceRateLimit(
      AI_GLOBAL_SCOPE,
      'global',
      AI_GLOBAL_POINTS,
      AI_GLOBAL_WINDOW_SECONDS,
      'Too many AI requests globally. Please try again shortly.'
    );
    await enforceRateLimit(
      AI_PER_USER_SCOPE,
      `user:${user.id}`,
      AI_PER_USER_POINTS,
      AI_PER_USER_WINDOW_SECONDS,
      'You are sending AI requests too quickly. Please slow down.'
    );

    const task = findTaskForTurn(scenario, input.taskId);

    let reply: string;
    try {
      reply = await generateManagerReplyViaGemini({
        company: scenario.company,
        role: scenario.role,
        managerName: scenario.managerName,
        managerTitle: scenario.managerTitle,
        taskTitle: task.title,
        taskBrief: task.brief,
        history: turns.map((t) => ({ speaker: t.speaker, content: t.content })),
        studentAnswer: lastAnswer,
      });
      log.info(
        { userId: user.id, sessionId: input.sessionId, taskId: task.id, provider: 'gemini' },
        'AI reply generated'
      );
    } catch (aiErr) {
      log.warn(
        { err: aiErr, userId: user.id, sessionId: input.sessionId },
        'AI provider failed; using deterministic fallback'
      );
      reply = generateManagerReply(scenario, task, lastAnswer, turns.length);
    }

    return NextResponse.json({ ok: true, reply });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode });
    }
    log.error({ err }, 'AI route failed');
    return NextResponse.json(sanitizeError(err), { status: 500 });
  }
}

function findTaskForTurn(
  scenario: NonNullable<ReturnType<typeof getScenario>>,
  taskId?: string
): NonNullable<ReturnType<typeof getScenario>>['tasks'][number] {
  if (taskId) {
    const t = scenario.tasks.find((task) => task.id === taskId);
    if (t) return t;
  }
  return scenario.tasks[0];
}
