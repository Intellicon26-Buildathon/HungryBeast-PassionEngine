import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseRouteClient } from '@/lib/supabase/server';
import { signUpSchema } from '@/lib/validation';
import { appOrigin } from '@/lib/config';
import { logger } from '@/lib/logger';
import { ValidationError, AppError, sanitizeError, normalizeError } from '@/lib/error';

const log = logger;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const input = signUpSchema.parse(body);

    const client = await requireSupabaseRouteClient();

    // Attempt to create the auth user.
    const { data, error } = await client.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        emailRedirectTo: `${appOrigin}/auth/callback`,
        data: {
          display_name: input.displayName,
        },
      },
    });

    if (error) {
      log.warn({ code: error.code, status: error.status, msg: error.message }, 'Supabase sign-up error');
      // Map common Supabase auth errors into app errors.
      if (error.code === 'email_exists') {
        throw new ValidationError('An account with this email already exists.');
      }
      if (error.code === 'weak_password') {
        throw new ValidationError('Password does not meet the current requirements.');
      }
      if (error.code === 'invalid_email') {
        throw new ValidationError('Enter a valid email address.');
      }
      // Supabase 4xx messages are user-facing (rate limits, signups disabled…).
      if (error.status && error.status >= 400 && error.status < 500) {
        throw new ValidationError(error.message);
      }
      throw new AppError('auth_error', 'Unable to create account', 500, 'Could not create your account right now.');
    }

    if (!data.user) {
      throw new AppError('auth_error', 'Account created without user data', 500, 'Something went wrong creating your account.');
    }

    // The profile row is created by the `on_auth_user_created` DB trigger
    // (display_name comes from the user metadata above). Writing it from here
    // would fail RLS whenever email confirmation means there is no session yet.

    log.info({ userId: data.user.id, email: input.email }, 'User signed up');

    return NextResponse.json({
      ok: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      // No session back from signUp ⇒ Supabase is waiting on email confirmation.
      requiresConfirmation: data.session === null,
    });
  } catch (err) {
    err = normalizeError(err);
    if (err instanceof AppError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode });
    }
    log.error({ err }, 'Signup failed');
    return NextResponse.json(sanitizeError(err), { status: 500 });
  }
}
