import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { sanitizeError } from '@/lib/error';

const log = logger;

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: true, user: null }, { status: 200 });
    }
    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email } });
  } catch (err) {
    log.warn({ err }, 'Me check failed');
    return NextResponse.json(sanitizeError(err), { status: 500 });
  }
}
