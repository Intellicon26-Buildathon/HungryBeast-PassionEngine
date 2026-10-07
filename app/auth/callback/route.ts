import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { publicEnv } from '@/lib/config';
import { logger } from '@/lib/logger';

const log = logger;

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;

  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    try {
      const response = NextResponse.redirect(origin + next);
      const supabase = createServerClient(
        publicEnv.NEXT_PUBLIC_SUPABASE_URL,
        publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          cookies: {
            get(name) {
              return request.cookies.get(name)?.value;
            },
            set(name, value, options) {
              request.cookies.set({
                name,
                value,
                ...options,
              });
              response.cookies.set({
                name,
                value,
                ...options,
              });
            },
            remove(name, options) {
              request.cookies.set({
                name,
                value: '',
                ...options,
              });
              response.cookies.set({
                name,
                value: '',
                ...options,
              });
            },
          },
        }
      );

      await supabase.auth.exchangeCodeForSession(code);
      return response;
    } catch (err) {
      log.warn({ err }, 'Auth callback exchange failed');
    }
  }

  return NextResponse.redirect(origin + '/signin?error=auth_callback_failed');
}
