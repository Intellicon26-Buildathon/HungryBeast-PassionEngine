import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseRouteClient } from '@/lib/supabase/server';
import { signUpSchema } from '@/lib/validation';
import { upsertProfile } from '@/lib/db';
import { logger } from '@/lib/logger';
import { ValidationError, AppError, sanitizeError } from '@/lib/error';

const log = logger;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const input = signUpSchema.parse(body);

    const client = requireSupabaseRouteClient();

    // Attempt to create the auth user.
    const { data, error } = await client.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_API_BASE_URL + '/auth/callback',
        data: {
          display_name: input.displayName,
        },
      },
    });

    if (error) {
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
      throw new AppError('auth_error', 'Unable to create account', 500, 'Could not create your account right now.');
    }

    if (!data.user) {
      throw new AppError('auth_error', 'Account created without user data', 500, 'Something went wrong creating your account.');
    }

    // Create or update the profile row so the product has a stable user record.
    try {
      await upsertProfile(data.user.id, {
        displayName: input.displayName,
      });
    } catch (profileErr) {
      log.warn({ err: profileErr, userId: data.user.id }, 'Profile creation failed; account was still created');
    }

    log.info({ userId: data.user.id, email: input.email }, 'User signed up');

    return NextResponse.json({
      ok: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      requiresConfirmation: data.session !== null,
    });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode });
    }
    log.error({ err }, 'Signup failed');
    return NextResponse.json(sanitizeError(err), { status: 500 });
  }
}
