import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ---------------------------------------------------------------------------
// lib/config is imported by the browser bundle, so it must NEVER throw on
// missing server-side env vars, and every backend flag must reflect the env
// exactly. These tests import it fresh under different environments.
// ---------------------------------------------------------------------------

const ENV_SNAPSHOT = { ...process.env };

const MANAGED_PREFIXES = [
  "SUPABASE_",
  "NEXT_PUBLIC_",
  "UPSTASH_",
  "AI_",
  "GEMINI_",
  "APP_ORIGIN",
  "NODE_ENV",
  "LOG_LEVEL",
  "VERCEL_",
];

function withEnv(env: Record<string, string | undefined>) {
  for (const k of Object.keys(process.env)) {
    if (MANAGED_PREFIXES.some((p) => k.startsWith(p))) delete process.env[k];
  }
  for (const [k, v] of Object.entries(env)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
}

async function loadConfig() {
  vi.resetModules();
  return import("@/lib/config");
}

beforeEach(() => {
  withEnv({ NODE_ENV: "test" });
});

afterEach(() => {
  process.env = { ...ENV_SNAPSHOT };
});

describe("environment config", () => {
  it("parses with a completely empty environment (browser-safe, no throw)", async () => {
    const cfg = await loadConfig();
    expect(cfg.supabasePublicConfigured).toBe(false);
    expect(cfg.supabaseServerConfigured).toBe(false);
    expect(cfg.rateLimitEnabled).toBe(false);
    expect(cfg.aiGatewayEnabled).toBe(false);
    expect(cfg.appOrigin).toBe("http://localhost:3000");
  });

  it("rejects a malformed NEXT_PUBLIC_SUPABASE_URL instead of failing silently", async () => {
    withEnv({ NODE_ENV: "test", NEXT_PUBLIC_SUPABASE_URL: "not a url" });
    await expect(loadConfig()).rejects.toThrow();
  });

  it("flags Supabase as configured when public vars are set", async () => {
    withEnv({
      NODE_ENV: "test",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    });
    const cfg = await loadConfig();
    expect(cfg.supabasePublicConfigured).toBe(true);
    expect(cfg.supabaseServerConfigured).toBe(false);
  });

  it("flags the server backend as configured with server vars", async () => {
    withEnv({
      NODE_ENV: "test",
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_ANON_KEY: "anon-key",
    });
    const cfg = await loadConfig();
    expect(cfg.supabaseServerConfigured).toBe(true);
  });

  it("enables the AI gateway only when a key is present, with bounded settings", async () => {
    withEnv({ NODE_ENV: "test", GEMINI_API_KEY: "key", AI_TIMEOUT_MS: "5000", AI_MAX_OUTPUT_TOKENS: "300" });
    const cfg = await loadConfig();
    expect(cfg.aiGatewayEnabled).toBe(true);
    expect(cfg.aiConfig.timeoutMs).toBe(5000);
    expect(cfg.aiConfig.maxOutputTokens).toBe(300);

    withEnv({ NODE_ENV: "test" });
    const cfg2 = await loadConfig();
    expect(cfg2.aiGatewayEnabled).toBe(false);
  });

  it("falls back to safe defaults for out-of-range numeric AI settings", async () => {
    withEnv({ NODE_ENV: "test", GEMINI_API_KEY: "key", AI_TIMEOUT_MS: "1", AI_MAX_OUTPUT_TOKENS: "999999" });
    const cfg = await loadConfig();
    expect(cfg.aiConfig.timeoutMs).toBe(20_000);
    expect(cfg.aiConfig.maxOutputTokens).toBe(700);
  });

  it("enables rate limiting only when both Upstash vars are present", async () => {
    withEnv({ NODE_ENV: "test", UPSTASH_REDIS_REST_URL: "https://cache.example.com" });
    const partial = await loadConfig();
    expect(partial.rateLimitEnabled).toBe(false);

    withEnv({
      NODE_ENV: "test",
      UPSTASH_REDIS_REST_URL: "https://cache.example.com",
      UPSTASH_REDIS_REST_TOKEN: "token",
    });
    const full = await loadConfig();
    expect(full.rateLimitEnabled).toBe(true);
  });

  it("treats Supabase as required in production and optional in development", async () => {
    withEnv({ NODE_ENV: "production" });
    const prod = await loadConfig();
    expect(prod.supabaseRequired).toBe(true);

    withEnv({ NODE_ENV: "development" });
    const dev = await loadConfig();
    expect(dev.supabaseRequired).toBe(false);
  });

  it("automatically infers origin from Vercel deployment URLs when APP_ORIGIN is unset", async () => {
    withEnv({ NODE_ENV: "test", VERCEL_URL: "my-preview-app.vercel.app" });
    const preview = await loadConfig();
    expect(preview.appOrigin).toBe("https://my-preview-app.vercel.app");

    withEnv({ NODE_ENV: "test", VERCEL_PROJECT_PRODUCTION_URL: "my-production-app.vercel.app" });
    const prod = await loadConfig();
    expect(prod.appOrigin).toBe("https://my-production-app.vercel.app");
  });
});
