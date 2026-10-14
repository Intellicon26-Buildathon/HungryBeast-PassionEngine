import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// ---------------------------------------------------------------------------
// Middleware: Supabase auth session refresh
// ---------------------------------------------------------------------------
// Runs the user's session past Supabase Auth on every navigation so the auth
// cookies stay fresh (standard @supabase/ssr pattern). When Supabase is not
// configured (prototype mode) this is a pass-through.
//
// Pages that read or write a user's data (PROTECTED_PATHS) redirect to
// /signin when there is no user. That is a UX convenience only — the real
// authorization still happens in the API routes and Postgres RLS.
//
// Response security headers live in next.config.mjs so they also cover static
// assets and do not depend on middleware execution.
// ---------------------------------------------------------------------------

const PROTECTED_PATHS = ['/dashboard', '/simulate', '/evaluation', '/settings', '/onboarding'];

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

  // Refreshes the auth cookie when close to expiry.
  let signedIn = true;
  try {
    const { data } = await supabase.auth.getUser();
    signedIn = !!data.user;
  } catch {
    // Network hiccup: keep serving; route handlers validate the JWT anyway.
  }

  const { pathname, search } = request.nextUrl;
  if (!signedIn && PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    const to = request.nextUrl.clone();
    to.pathname = '/signin';
    to.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(to);
  }

  return response;
}

export const config = {
  matcher: [
    // Run on everything except static assets and Next internals.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)',
  ],
};
