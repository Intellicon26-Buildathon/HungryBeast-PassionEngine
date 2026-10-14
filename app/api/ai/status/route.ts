import { NextResponse } from 'next/server';
import { aiConfig } from '@/lib/config';
import { serverEnv } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const mode = aiConfig.enabled
    ? 'gemini'
    : serverEnv.NODE_ENV === 'production'
    ? 'unavailable'
    : 'demo';

  return NextResponse.json({
    ok: true,
    status: { mode, model: aiConfig.model },
  });
}
