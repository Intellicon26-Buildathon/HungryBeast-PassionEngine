import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseRouteClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { ValidationError, sanitizeError } from '@/lib/error';

const log = logger;

const resendConfirmationSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const input = resendConfirmationSchema.parse(body);

    const client = requireSupabaseRouteClient();

    const { error } = await client.auth.resend({
      type: 'signup',
      email: input.email,
    });

    if (error) {
      if (error.code === 'invalid_email') {
        throw new ValidationError('Enter a valid email address.');
      }
      throw new ValidationError('Could not resend confirmation. Try again shortly.');
    }

    log.info({ email: input.email }, 'Confirmation resent');

    return NextResponse.json({
      ok: true,
      message: 'Confirmation email sent. Please check your inbox.',
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json(err.toJSON(), { status: err.statusCode });
    }
    log.warn({ err }, 'Confirmation resend failed');
    return NextResponse.json(sanitizeError(err), { status: 500 });
  }
}
