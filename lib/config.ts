import { z } from 'zod';

// ---------------------------------------------------------------------------
// Environment validation
// ---------------------------------------------------------------------------
// This module is imported by BOTH the browser bundle (public vars only) and
// server code. Therefore:
//   1. Only NEXT_PUBLIC_* values may be read eagerly.
//   2. Server-only values are parsed into a non-throwing shape; server code
//      must check the `configured` flags (or use the require* helpers) before
//      touching a backend. A missing/invalid value is never silently treated
//      as "works anyway" at the point of use — the flags make misconfiguration
//      explicit and testable.
//
// Prototype mode: with no backend env at all, the app runs the deterministic
// mock AI + browser-local persistence. Every backend path fails loudly and
// honestly instead of pretending to work.
// ---------------------------------------------------------------------------

/** URL that may be empty (unconfigured). Anything non-empty must be a URL. */
const optionalUrl = z
  .union([z.literal(''), z.string().url('Must be a valid URL')])
  .default('');

/** Optional free-form secret/string. Empty string means "not provided". */
const optionalSecret = z.string().default('');

/** Integer env var with bounds; missing/invalid/out-of-range falls back to the default. */
const intVar = (fallback: number, min: number, max: number) =>
  z.preprocess(
    (v) => {
      if (v === undefined || v === null || v === '') return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    },
    z.number().int().min(min).max(max).catch(fallback).default(fallback)
  );

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalSecret,
  NEXT_PUBLIC_API_BASE_URL: optionalUrl,
});

const serverEnvSchema = z.object({
  // Supabase (server-side). The anon key here mirrors the public one.
  SUPABASE_URL: optionalUrl,
  SUPABASE_ANON_KEY: optionalSecret,
  SUPABASE_SERVICE_ROLE_KEY: optionalSecret,

  // Upstash Redis (rate limiting / quotas).
  UPSTASH_REDIS_REST_URL: optionalUrl,
  UPSTASH_REDIS_REST_TOKEN: optionalSecret,

  // AI provider — all AI calls happen server-side only.
  AI_PROVIDER: z.enum(['gemini']).default('gemini'),
  GEMINI_API_KEY: optionalSecret,
  AI_MODEL: z.string().default('gemini-3.8-flash'),
  AI_TIMEOUT_MS: intVar(20_000, 1_000, 120_000),
  AI_MAX_OUTPUT_TOKENS: intVar(700, 64, 8_192),

  APP_ORIGIN: optionalUrl,
  LOG_LEVEL: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Each NEXT_PUBLIC_* var must be referenced literally: Next.js only inlines
// `process.env.NEXT_PUBLIC_X` expressions into the browser bundle. Passing the
// whole `process.env` object would leave every value empty in the browser.
export const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
});
export const serverEnv = serverEnvSchema.parse(process.env);

export const DEFAULT_AI_MODEL = 'gemini-3.8-flash';
const GEMINI_MODEL_ID = /^gemini-[a-z0-9][a-z0-9.-]*$/i;

export function resolveAiModel(configuredModel: string | undefined): {
  model: string;
  warning?: string;
} {
  const model = configuredModel?.trim();
  if (!model) return { model: DEFAULT_AI_MODEL };
  if (!GEMINI_MODEL_ID.test(model)) {
    return {
      model: DEFAULT_AI_MODEL,
      warning: `AI_MODEL must be a full Gemini model ID. Using ${DEFAULT_AI_MODEL}; update the Vercel AI_MODEL setting to remove this warning.`,
    };
  }
  return { model };
}

// ---------------------------------------------------------------------------
// Configuration flags (checked at the point of use, never trusted implicitly)
// ---------------------------------------------------------------------------

/** True when the browser may talk to Supabase Auth directly. */
export const supabasePublicConfigured =
  publicEnv.NEXT_PUBLIC_SUPABASE_URL !== '' &&
  publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY !== '';

/** True when server-side Supabase (DB + auth admin) is usable. */
export const supabaseServerConfigured =
  serverEnv.SUPABASE_URL !== '' && serverEnv.SUPABASE_ANON_KEY !== '';

/** True when privileged (RLS-bypassing) operations are possible. */
export const supabaseServiceConfigured = serverEnv.SUPABASE_SERVICE_ROLE_KEY !== '';

/** True when Upstash rate limiting should be used. */
export const rateLimitEnabled =
  serverEnv.UPSTASH_REDIS_REST_URL !== '' &&
  serverEnv.UPSTASH_REDIS_REST_TOKEN !== '';

/** True when the server-side AI gateway has a provider key. */
export const aiGatewayEnabled = serverEnv.GEMINI_API_KEY !== '';

/** True when the app should treat Supabase as a required dependency. */
export const supabaseRequired = serverEnv.NODE_ENV === 'production';

/** Public base URL used for auth callbacks/links. */
export const appOrigin =
  serverEnv.APP_ORIGIN ||
  publicEnv.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined) ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
  'http://localhost:3000';

/** Server-side AI gateway settings (never imported into the browser bundle). */
const resolvedAiModel = resolveAiModel(serverEnv.AI_MODEL);
export const aiConfig = {
  provider: serverEnv.AI_PROVIDER,
  apiKey: serverEnv.GEMINI_API_KEY,
  model: resolvedAiModel.model,
  modelWarning: resolvedAiModel.warning,
  timeoutMs: serverEnv.AI_TIMEOUT_MS,
  maxOutputTokens: serverEnv.AI_MAX_OUTPUT_TOKENS,
  enabled: aiGatewayEnabled,
} as const;

// ---------------------------------------------------------------------------
// Auth/email UX config (used by both backend and email templates/hooks)
// ---------------------------------------------------------------------------

export const authConfig = {
  enableEmailConfirmation: true,
  enableMagicLink: false,
  enableEmailChange: true,
  enablePasswordReset: true,

  passwordPolicy: {
    minLength: 8,
    requireUppercase: false,
    requireLowercase: false,
    requireNumber: false,
    requireNonAlpha: false,
  },

  emailFromName: 'Passion Discovery Engine',
  emailSupportSubjectPrefix: '[Passion Discovery Engine]',
} as const;
