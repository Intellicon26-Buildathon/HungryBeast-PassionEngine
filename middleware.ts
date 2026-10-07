import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// ---------------------------------------------------------------------------
// Middleware: Supabase auth session refresh
// ---------------------------------------------------------------------------
// Runs the user's session past Supabase Auth on every navigation so the auth
// cookies stay fresh (standard @supabase/ssr pattern). When Supabase is not
// configured (prototype mode) this is a pass-through.
//
// Response security headers live in next.config.mjs so they also cover static
// assets and do not depend on middleware execution.
// ---------------------------------------------------------------------------

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let response = NextResponse.next({ request });

  if (!url || !anonKey) {
    return response; // prototype mode: no auth backend configured
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refreshes the auth cookie when close to expiry. Never gate pages here —
  // authorization stays in the API routes / RLS.
  try {
    await supabase.auth.getUser();
  } catch {
    // Network hiccup: keep serving; route handlers validate the JWT anyway.
  }

  return response;
}

export const config = {
  matcher: [
    // Run on everything except static assets and Next internals.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)',
  ],
};
