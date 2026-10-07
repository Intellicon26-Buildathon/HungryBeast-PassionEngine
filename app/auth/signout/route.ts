import { NextResponse } from 'next/server';
import { requireSupabaseRouteClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { sanitizeError } from '@/lib/error';

const log = logger;

export async function POST() {
  try {
    const client = requireSupabaseRouteClient();
    const { error } = await client.auth.signOut({ scope: 'local' });
    if (error) {
      log.warn({ err: error }, 'Sign-out failed');
      throw new Error('Sign-out failed');
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    log.warn({ err }, 'Sign-out request failed');
    return NextResponse.json(sanitizeError(err), { status: 500 });
  }
}
