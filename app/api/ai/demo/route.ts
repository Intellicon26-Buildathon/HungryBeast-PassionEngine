import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { serverEnv, aiConfig } from '@/lib/config';
import { generateManagerReplyViaGemini } from '@/lib/ai/gemini';
import { generateManagerReply } from '@/lib/mockAI';
import { getCareer, getScenario } from '@/lib/scenarios';
import { AppError, normalizeError, sanitizeError } from '@/lib/error';
import { logger } from '@/lib/logger';

const log = logger;

const demoReplySchema = z.object({
  careerSlug: z.string().min(1),
  scenarioSlug: z.string().min(1),
  taskId: z.string().min(1),
  studentAnswer: z.string().trim().min(2).max(3_000),
  history: z.array(z.object({
    speaker: z.enum(['manager', 'student']),
    content: z.string().max(3_000),
  })).max(12),
});

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  if (serverEnv.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (req.headers.get('origin') !== new URL(req.url).origin) {
    return NextResponse.json(
      { error: { code: 'invalid_origin', message: 'Use the local application to request a practice reply.' } },
      { status: 403 }
    );
  }

  try {
    const input = demoReplySchema.parse(await req.json());
    const career = getCareer(input.careerSlug);
    const scenario = getScenario(input.scenarioSlug);
    const task = scenario?.tasks.find((item) => item.id === input.taskId);

    if (!career?.available || scenario?.careerSlug !== career.slug || !task) {
      return NextResponse.json(
        { error: { code: 'simulation_not_found', message: 'This simulation task is not available.' } },
        { status: 404 }
      );
    }

    if (!aiConfig.enabled) {
      const reply = generateManagerReply(
        scenario,
        task,
        input.studentAnswer,
        input.history.length
      );
      return NextResponse.json({ ok: true, mode: 'demo', reply });
    }

    const reply = await generateManagerReplyViaGemini({
      company: scenario.company,
      role: scenario.role,
      managerName: scenario.managerName,
      managerTitle: scenario.managerTitle,
      taskTitle: task.title,
      taskBrief: task.brief,
      history: input.history,
      studentAnswer: input.studentAnswer,
    });
    return NextResponse.json({ ok: true, mode: 'gemini', reply });
  } catch (err) {
    err = normalizeError(err);
    log.warn({ err }, 'Local AI simulation reply failed');
    if (err instanceof AppError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode });
    }
    return NextResponse.json(sanitizeError(err), { status: 500 });
  }
}
