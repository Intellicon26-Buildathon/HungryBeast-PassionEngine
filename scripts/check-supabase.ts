/**
 * Supabase connectivity & configuration check.
 *
 * Usage:  npm run db:check
 *
 * Verifies, in order:
 *   1. Required env vars are present in .env.local / environment
 *   2. The Supabase URL is reachable
 *   3. The service-role key can read auth settings (proves the key works)
 *   4. The expected tables exist
 *
 * Exits non-zero on any failure so CI can gate on it.
 */
import 'dotenv/config';

const log = (icon: string, msg: string) => console.log(`${icon}  ${msg}`);
const fail = (msg: string): never => {
  console.error(`✖  ${msg}`);
  process.exit(1);
};

async function main() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error('✖  SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (check .env.local).');
    process.exit(1);
  }

  log('→', `Checking ${url} …`);

  // 1. Auth settings endpoint — proves URL + service key are valid.
  const res = await fetch(`${url}/auth/v1/settings`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  if (!res.ok) {
    fail(`Supabase auth endpoint responded ${res.status}. Check the URL and service-role key.`);
  }
  log('✓', 'Service-role key accepted by Supabase Auth.');

  // 2. REST root — prove the project is up.
  const rest = await fetch(`${url}/rest/v1/`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  if (!rest.ok) fail(`Supabase REST root responded ${rest.status}.`);
  log('✓', 'PostgREST is reachable.');

  // 3. Expected tables exist (OpenAPI description lists tables + columns).
  const openapi = (await (await fetch(`${url}/rest/v1/`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  })).json()) as { definitions?: Record<string, unknown> };

  const expected = ['profiles', 'simulation_sessions', 'simulation_turns', 'session_evaluations'];
  const missing = expected.filter((t) => !openapi.definitions?.[t]);
  if (missing.length > 0) {
    fail(`Missing tables: ${missing.join(', ')}. Run docs/supabase-schema.sql first.`);
  }
  log('✓', `All expected tables present: ${expected.join(', ')}`);

  log('✔', 'Supabase is configured and healthy.');
}

main().catch((err: unknown) => {
  fail(err instanceof Error ? err.message : String(err));
});
