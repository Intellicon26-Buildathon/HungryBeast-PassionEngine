import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { publicEnv, supabasePublicConfigured } from '../config';

// ---------------------------------------------------------------------------
// Browser Supabase client
// ---------------------------------------------------------------------------
// The browser only ever gets the public (anon) key. Server-only clients live
// in ./server — never import that file from client code.
//
// When Supabase is not configured (prototype mode), this returns null instead
// of throwing, so the UI can render normally without a backend.
// ---------------------------------------------------------------------------

/** True when the browser may talk to Supabase Auth. */
export const isSupabaseBrowserConfigured = supabasePublicConfigured;

/**
 * Browser-safe Supabase client, or null when Supabase is not configured.
 * Use only in client components and browser code.
 */
export function createSupabaseBrowserClient(): SupabaseClient | null {
  if (!supabasePublicConfigured) return null;
  return createBrowserClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
