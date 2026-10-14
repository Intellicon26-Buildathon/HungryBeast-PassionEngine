import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/supabase/server';
import { enforceRateLimit } from '@/lib/rate-limit';
import { getSessionById, listTurnsBySession, addTurnToSession } from '@/lib/db';
import { toClientTurn } from '@/lib/db/mappers';
import { generateManagerReply } from '@/lib/mockAI';
import { generateManagerReplyViaGemini } from '@/lib/ai/gemini';
import { getScenario } from '@/lib/scenarios';
import { serverEnv } from '@/lib/config';
import { logger } from '@/lib/logger';
import {
  NotFoundError,
  AppError,
  ConfigurationError,
  ValidationError,
  sanitizeError,
  normalizeError,
} from '@/lib/error';
import { aiConfig } from '@/lib/config';

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
//   4. Call Gemini via the bounded gateway; only development may use a
//      deterministic fallback so production never returns mock AI content.
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
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    const body = await req.json().catch(() => ({}));
    const input: AiReplyRequest = {
      sessionId: typeof body.sessionId === 'string' ? body.sessionId : '',
      scenarioSlug: typeof body.scenarioSlug === 'string' ? body.scenarioSlug : '',
      taskId: typeof body.taskId === 'string' ? body.taskId : undefined,
    };

    if (!input.sessionId || !input.scenarioSlug) {
      throw new ValidationError('sessionId and scenarioSlug are required');
    }

    // Session must exist and belong to the caller.
    const session = await getSessionById(user.id, input.sessionId);
    if (session.scenario_slug !== input.scenarioSlug) {
      throw new ValidationError('The requested simulation does not match this session.');
    }

    const scenario = getScenario(session.scenario_slug);
    if (!scenario) {
      throw new NotFoundError('Scenario', session.scenario_slug);
    }

    // The latest student answer from persisted history wins over what the
    // client claims, so replies always respond to stored evidence.
    const turns = await listTurnsBySession(user.id, input.sessionId);
    const studentTurns = turns.filter((t) => t.speaker === 'student');
    const lastAnswer = studentTurns[studentTurns.length - 1]?.content ?? '';

    if (!lastAnswer.trim()) {
      throw new ValidationError('Save an answer before requesting a manager reply.');
    }

    const task = scenario.tasks[session.current_task_index];
    if (!task) {
      throw new ValidationError('The current task is not available for this simulation.');
    }
    if (input.taskId && input.taskId !== task.id) {
      throw new ValidationError('The requested task does not match the current simulation task.');
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
        'AI provider failed'
      );
      if (serverEnv.NODE_ENV === 'production' || aiConfig.enabled) {
        const publicMessage = aiErr instanceof ConfigurationError
          ? 'Gemini is not configured. Add GEMINI_API_KEY to the server environment.'
          : aiErr instanceof AppError && aiErr.publicMessage
          ? aiErr.publicMessage
          : 'Gemini could not complete this reply. Check the server logs and try again.';
        throw new AppError(
          'ai_unavailable',
          'AI manager reply generation failed',
          503,
          `${publicMessage} Your saved answer is safe.`
        );
      }
      reply = generateManagerReply(scenario, task, lastAnswer, turns.length);
    }

    // Persist the reply server-side so the transcript is the source of truth
    // and the client can never forge what the manager said.
    const saved = await addTurnToSession(user.id, {
      sessionId: input.sessionId,
      speaker: 'manager',
      content: reply,
      taskId: task.id,
    });

    return NextResponse.json({ ok: true, reply, turn: toClientTurn(saved, turns.length) });
  } catch (err) {
    err = normalizeError(err);
    if (err instanceof AppError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode });
    }
    log.error({ err }, 'AI route failed');
    return NextResponse.json(sanitizeError(err), { status: 500 });
  }
}
