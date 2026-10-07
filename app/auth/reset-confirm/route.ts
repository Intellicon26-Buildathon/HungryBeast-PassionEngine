import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseRouteClient } from '@/lib/supabase/server';
import { passwordResetConfirmSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { ValidationError, sanitizeError, UnauthorizedError } from '@/lib/error';

const log = logger;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const input = passwordResetConfirmSchema.parse(body);

    const client = requireSupabaseRouteClient();

    const { error } = await client.auth.updateUser({
      password: input.password,
    });

    if (error) {
      if (error.code === 'weak_password') {
        throw new ValidationError('New password does not meet the current requirements.');
      }
      if (error.code === 'invalid_token') {
        throw new UnauthorizedError('Password reset link is invalid or expired. Please request a new one.');
      }
      throw new ValidationError('Could not update password. Try again shortly.');
    }

    log.info({ email: input.password.length > 0 ? 'updated' : 'unknown' }, 'Password reset completed');

    return NextResponse.json({
      ok: true,
      message: 'Your password has been updated. You can now sign in with the new password.',
    });
  } catch (err) {
    if (err instanceof ValidationError || err instanceof UnauthorizedError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode });
    }
    log.warn({ err }, 'Password reset confirmation failed');
    return NextResponse.json(sanitizeError(err), { status: 500 });
  }
}
