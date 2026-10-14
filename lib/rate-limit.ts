import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { rateLimitEnabled, serverEnv } from './config';
import { AppError, ConfigurationError, RateLimitedError } from './error';
import { logger } from './logger';

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------
// Redis-backed, serverless-safe rate limiting via Upstash.
//
// Two separate concerns are handled later in the app:
//  1) AI provider gateway limiter with retry-safe backoff (existential).
//  2) Per-user daily simulation quota (business rule quota, not a rate limit).
//
// This module is the shared Redis/RateLimit setup plus the common helpers.
// ---------------------------------------------------------------------------

const log = logger;

function redisClient() {
  if (!serverEnv.UPSTASH_REDIS_REST_URL || !serverEnv.UPSTASH_REDIS_REST_TOKEN) {
    if (serverEnv.NODE_ENV === 'production') {
      throw new AppError(
        'configuration_error',
        'Upstash Redis must be configured in production',
        503,
        'The AI service is temporarily unavailable.'
      );
    }
    if (rateLimitEnabled) {
      throw new ConfigurationError(
        'Upstash Redis config is incomplete. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN when rate limiting is enabled.'
      );
    }
    return null;
  }

  return new Redis({
    url: serverEnv.UPSTASH_REDIS_REST_URL,
    token: serverEnv.UPSTASH_REDIS_REST_TOKEN,
  });
}

function ratelimitInstance(points: number, windowSeconds: number) {
  const redis = redisClient();
  if (!redis || !rateLimitEnabled) {
    // Development remains usable without provisioning Redis.
    return null;
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(points, `${windowSeconds} s`),
    prefix: `pde`,
  });
}

/**
 * Check a rate limit and throw RateLimitedError when exceeded.
 * Returns the remaining capacity info for logging/telemetry.
 */
export async function checkRateLimit(
  scope: string,
  key: string,
  points: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number | null; resetAt: number | null }> {
  const rl = ratelimitInstance(points, windowSeconds);
  if (!rl) {
    return { allowed: true, remaining: points, resetAt: null };
  }

  try {
    const result = await rl.limit(`pde:${scope}:${key}`);
    // `success` is the authoritative verdict from the sliding-window limiter;
    // `remaining` can legitimately be 0 on the last allowed request.
    return {
      allowed: result.success,
      remaining: result.remaining,
      resetAt: result.reset,
    };
  } catch (err) {
    log.error({ err, key, scope }, 'Rate limit check failed');
    if (serverEnv.NODE_ENV === 'production') {
      throw new AppError(
        'rate_limit_unavailable',
        'Upstash rate-limit check failed',
        503,
        'The AI service is temporarily unavailable. Please try again shortly.'
      );
    }
    return { allowed: true, remaining: points, resetAt: null };
  }
}

/**
 * Enforce a rate limit. Throws RateLimitedError when denied.
 */
export async function enforceRateLimit(
  scope: string,
  key: string,
  points: number,
  windowSeconds: number,
  message?: string
): Promise<void> {
  const { allowed } = await checkRateLimit(scope, key, points, windowSeconds);
  if (!allowed) {
    throw new RateLimitedError(message);
  }
}
