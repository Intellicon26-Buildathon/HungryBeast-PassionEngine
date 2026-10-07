import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  publicEnv,
  serverEnv,
  supabasePublicConfigured,
  supabaseServiceConfigured,
} from '../config';
import { AppError, ConfigurationError, UnauthorizedError } from '../error';

// ---------------------------------------------------------------------------
// Server-only Supabase clients
// ---------------------------------------------------------------------------
// These files are server-only by intent. They should never be imported into
// client components. If you see a bundler trying to include them in the browser
// bundle, that is the signal to move the import behind a server boundary.
//
// Two clients with two very different jobs:
//   • Route client  — cookie-bound (@supabase/ssr). Carries the user's JWT, so
//     Postgres RLS and Auth calls act as the signed-in user. Used by API
//     routes, server actions, and requireUser().
//   • Service-role client — bypasses RLS. Only for privileged backend tasks.
//     Never usable from the browser, never returned to the client.
// ---------------------------------------------------------------------------

/**
 * Cookie-bound Supabase client for Route Handlers / Server Actions.
 * Returns null when Supabase is not configured (prototype mode) so callers
 * can fail with an honest error instead of a crash.
 */
export function getSupabaseRouteClient(): SupabaseClient | null {
  if (!supabasePublicConfigured) return null;

  const cookieStore = cookies();

  return createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component render — safe to ignore because
            // middleware refreshes sessions before pages render.
          }
        },
      },
    }
  );
}

/**
 * Route client for endpoints that cannot work without Supabase.
 * Throws an honest 503 when the backend is not configured.
 */
export function requireSupabaseRouteClient(): SupabaseClient {
  const client = getSupabaseRouteClient();
  if (!client) {
    throw new AppError(
      'configuration_error',
      'Supabase auth is not configured on this server',
      503,
      'Accounts are not available on this server yet.'
    );
  }
  return client;
}

let _serviceRoleClient: SupabaseClient | null = null;

/**
 * Privileged service-role client. Bypasses RLS — use only for admin
 * operations that explicitly require it. Throws when not configured.
 */
export function getSupabaseServiceRoleClient(): SupabaseClient {
  if (_serviceRoleClient) return _serviceRoleClient;

  if (!supabaseServiceConfigured || !serverEnv.SUPABASE_URL) {
    throw new ConfigurationError(
      'Supabase service-role config is missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for privileged backend tasks.'
    );
  }

  _serviceRoleClient = createClient(
    serverEnv.SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: { 'x-client-name': 'passion-discovery-engine-service' },
      },
    }
  );

  return _serviceRoleClient;
}

// ---------------------------------------------------------------------------
// Auth helpers (server-side)
// ---------------------------------------------------------------------------

export interface AuthUser {
  id: string;
  email: string | null;
}

/**
 * Returns the signed-in user from the request's auth cookies, or null.
 * The JWT is validated by Supabase Auth on every call.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const client = getSupabaseRouteClient();
  if (!client) return null;

  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;

  return { id: data.user.id, email: data.user.email ?? null };
}

/**
 * Require an authenticated user in server contexts.
 * Throws UnauthorizedError when no user is present or when the auth backend
 * is not configured (there cannot be a user without it).
 */
export async function requireUser(): Promise<AuthUser> {
  const client = getSupabaseRouteClient();
  if (!client) {
    throw new UnauthorizedError('Authentication is not configured on this server.');
  }

  const { data, error } = await client.auth.getUser();
  if (error || !data.user) {
    throw new UnauthorizedError('You must be signed in to do that.');
  }

  return { id: data.user.id, email: data.user.email ?? null };
}
