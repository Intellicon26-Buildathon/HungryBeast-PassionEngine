import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseRouteClient } from '@/lib/supabase/server';
import { signInSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { UnauthorizedError, ValidationError, AppError, sanitizeError } from '@/lib/error';

const log = logger;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const input = signInSchema.parse(body);

    const client = requireSupabaseRouteClient();

    const { data, error } = await client.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      if (error.code === 'invalid_credentials') {
        throw new UnauthorizedError('Invalid email or password.');
      }
      if (error.code === 'user_not_found') {
        throw new UnauthorizedError('Invalid email or password.');
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
    if (err instanceof AppError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode });
    }
    log.error({ err }, 'Sign-in failed');
    return NextResponse.json(sanitizeError(err), { status: 500 });
  }
}
