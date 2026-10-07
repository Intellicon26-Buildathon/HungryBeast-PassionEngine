import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseRouteClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/supabase/server';
import { emailChangeRequestSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { ValidationError, UnauthorizedError, sanitizeError } from '@/lib/error';

const log = logger;

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    const body = await req.json().catch(() => ({}));
    const input = emailChangeRequestSchema.parse(body);

    const client = requireSupabaseRouteClient();

    const { error } = await client.auth.updateUser({
      email: input.newEmail,
    });

    if (error) {
      if (error.code === 'invalid_password') {
        throw new ValidationError('Current password is incorrect.');
      }
      if (error.code === 'invalid_email') {
        throw new ValidationError('Enter a valid new email address.');
      }
      throw new ValidationError('Could not request email change. Try again shortly.');
    }

    log.info({ userId: user.id, newEmail: input.newEmail }, 'Email change requested');

    return NextResponse.json({
      ok: true,
      message: 'If that email is valid, we sent a confirmation link for the change.',
    });
  } catch (err) {
    if (err instanceof ValidationError || err instanceof UnauthorizedError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode });
    }
    log.warn({ err }, 'Email change request failed');
    return NextResponse.json(sanitizeError(err), { status: 500 });
  }
}
