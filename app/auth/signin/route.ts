import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseRouteClient } from '@/lib/supabase/server';
import { signInSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { UnauthorizedError, ValidationError, AppError, sanitizeError, normalizeError } from '@/lib/error';

const log = logger;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const input = signInSchema.parse(body);

    const client = await requireSupabaseRouteClient();

    const { data, error } = await client.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      log.warn({ code: error.code, status: error.status, msg: error.message }, 'Supabase sign-in error');
      if (error.code === 'invalid_credentials' || error.status === 400) {
        throw new UnauthorizedError('Invalid email or password.');
      }
      if (error.code === 'user_not_found') {
        throw new UnauthorizedError('Invalid email or password.');
      }
      if (error.code === 'email_not_confirmed') {
        throw new UnauthorizedError('Please confirm your email first — check your inbox for the link.');
      }
      throw new AppError('auth_error', 'Sign-in failed', 500, 'Could not sign you in right now.');
    }

    if (!data.user) {
      throw new UnauthorizedError('Sign-in did not return a user.');
    }

    log.info({ userId: data.user.id, email: input.email }, 'User signed in');

    return NextResponse.json({
      ok: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (err) {
    err = normalizeError(err);
    if (err instanceof AppError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode });
    }
    log.error({ err }, 'Sign-in failed');
    return NextResponse.json(sanitizeError(err), { status: 500 });
  }
}
