import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// When Upstash is not configured (dev/prototype), rate limiting must be
// completely inert: every check passes and no Redis client is constructed.

const ENV_SNAPSHOT = { ...process.env };

beforeEach(() => {
  vi.resetModules();
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
});

afterEach(() => {
  process.env = { ...ENV_SNAPSHOT };
  vi.unstubAllGlobals();
});

describe("rate limit without Upstash configured", () => {
  it("allows every request", async () => {
    const { checkRateLimit, enforceRateLimit } = await import("@/lib/rate-limit");

    const result = await checkRateLimit("scope", "key", 5, 60);
    expect(result).toEqual({ allowed: true, remaining: 5, resetAt: null });

    await expect(enforceRateLimit("scope", "key", 5, 60)).resolves.toBeUndefined();
  });
});

describe("rate limit with Upstash configured", () => {
  it("enforces the limit when Redis says denied", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://cache.example.com";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";

    const limit = vi.fn(async () => ({ success: false, remaining: 0, reset: 123 }));
    vi.doMock("@upstash/ratelimit", () => ({
      Ratelimit: class {
        constructor(_opts: unknown) {}
        static slidingWindow() {
          return () => {};
        }
        limit = limit;
      },
    }));
    vi.doMock("@upstash/redis", () => ({
      Redis: class {
        constructor(_opts: unknown) {}
      },
    }));

    const { enforceRateLimit } = await import("@/lib/rate-limit");
    await expect(enforceRateLimit("scope", "key", 5, 60)).rejects.toThrow(/Too many requests/i);
    expect(limit).toHaveBeenCalled();
  });
});
