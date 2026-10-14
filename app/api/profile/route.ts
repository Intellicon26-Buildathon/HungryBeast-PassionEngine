import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/supabase/server';
import { getProfile, updateProfile } from '@/lib/db';
import { updateProfileSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { AppError, sanitizeError, normalizeError } from '@/lib/error';
import type { Profile } from '@/lib/db/schema';

const log = logger;

export const dynamic = 'force-dynamic';

function toClientProfile(p: Profile | null, email: string | null) {
  return {
    displayName: p?.display_name ?? '',
    email: p?.email ?? email,
    district: p?.district ?? '',
    preferredLanguage: p?.preferred_language ?? 'English',
    agreedToResearch: p?.agreed_to_research ?? false,
    agreedToShare: p?.agreed_to_share_results ?? false,
  };
}

export async function GET() {
  try {
    const user = await requireUser();
    const profile = await getProfile(user.id);
    return NextResponse.json({ ok: true, profile: toClientProfile(profile, user.email) });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const input = updateProfileSchema.parse(body);

    const profile = await updateProfile(user.id, input);
    log.info({ userId: user.id }, 'Profile updated');

    return NextResponse.json({ ok: true, profile: toClientProfile(profile, user.email) });
  } catch (err) {
    return errorResponse(err);
  }
}

function errorResponse(err: unknown) {
  err = normalizeError(err);
  if (err instanceof AppError) {
    return NextResponse.json(err.toJSON(), { status: err.statusCode });
  }
  log.error({ err }, 'Profile API failed');
  return NextResponse.json(sanitizeError(err), { status: 500 });
}
