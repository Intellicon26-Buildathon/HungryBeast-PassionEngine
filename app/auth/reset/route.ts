import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseRouteClient } from '@/lib/supabase/server';
import { passwordResetRequestSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { ValidationError, sanitizeError } from '@/lib/error';

const log = logger;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const input = passwordResetRequestSchema.parse(body);

    const client = requireSupabaseRouteClient();

    const { error } = await client.auth.resetPasswordForEmail(input.email, {
      redirectTo: process.env.NEXT_PUBLIC_API_BASE_URL + '/auth/reset-confirm',
    });

    if (error) {
      if (error.code === 'invalid_email') {
        throw new ValidationError('Enter a valid email address.');
      }
      throw new ValidationError('Could not start password reset. Try again shortly.');
    }

    log.info({ email: input.email }, 'Password reset requested');

    return NextResponse.json({
      ok: true,
      message: 'If that email exists, we sent a password reset link.',
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode });
    }
    log.warn({ err }, 'Password reset request failed');
    return NextResponse.json(sanitizeError(err), { status: 500 });
  }
}
