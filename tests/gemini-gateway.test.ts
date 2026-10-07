import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ---------------------------------------------------------------------------
// Gemini gateway unit tests. fetch is mocked; no network is touched.
// ---------------------------------------------------------------------------

const ENV_SNAPSHOT = { ...process.env };

function okReply(text: string) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }),
  } as unknown as Response;
}

const baseRequest = {
  company: "NovaTech",
  role: "Junior Product Manager",
  managerName: "Maya Perera",
  managerTitle: "Head of Product",
  taskTitle: "Investigate the drop",
  taskBrief: "Figure out why retention dropped.",
  history: [
    { speaker: "manager" as const, content: "Welcome to NovaTech." },
    { speaker: "student" as const, content: "Happy to be here." },
  ],
  studentAnswer: "I would segment the retention drop by onboarding cohort first.",
};

beforeEach(() => {
  vi.resetModules();
  process.env.GEMINI_API_KEY = "test-key";
  process.env.AI_MODEL = "gemini-test";
  process.env.AI_TIMEOUT_MS = "2000";
});

afterEach(() => {
  process.env = { ...ENV_SNAPSHOT };
  vi.unstubAllGlobals();
});

async function load() {
  return import("@/lib/ai/gemini");
}

describe("generateManagerReplyViaGemini", () => {
  it("throws a ConfigurationError when no API key is set", async () => {
    process.env.GEMINI_API_KEY = "";
    const { generateManagerReplyViaGemini } = await load();
    await expect(generateManagerReplyViaGemini(baseRequest)).rejects.toThrow(/GEMINI_API_KEY/);
  });

  it("returns the model text on success and never sends the key in the body", async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => okReply("Good start — which cohort?"));
    vi.stubGlobal("fetch", fetchMock);

    const { generateManagerReplyViaGemini } = await load();
    const reply = await generateManagerReplyViaGemini(baseRequest);

    expect(reply).toBe("Good start — which cohort?");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(String(init.body)).not.toContain("test-key");
    expect(String(init.headers ? JSON.stringify(init.headers) : "")).not.toContain("test-key");
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("key=test-key");
    expect(url).toContain("gemini-test");
  });

  it("retries once on a provider 500 and then succeeds", async () => {
    const fail = {
      ok: false,
      status: 500,
      text: async () => "boom",
    } as unknown as Response;
    let calls = 0;
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => {
      calls += 1;
      return calls === 1 ? fail : okReply("Recovered reply");
    });
    vi.stubGlobal("fetch", fetchMock);

    const { generateManagerReplyViaGemini } = await load();
    const reply = await generateManagerReplyViaGemini(baseRequest);
    expect(reply).toBe("Recovered reply");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("treats a permanent 4xx as non-retryable", async () => {
    const bad = {
      ok: false,
      status: 400,
      text: async () => "bad request",
    } as unknown as Response;
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => bad);
    vi.stubGlobal("fetch", fetchMock);

    const { generateManagerReplyViaGemini } = await load();
    await expect(generateManagerReplyViaGemini(baseRequest)).rejects.toThrow(/rejected/);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("fails loudly on an empty completion so the route can fall back to the mock", async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => okReply(""));
    vi.stubGlobal("fetch", fetchMock);

    const { generateManagerReplyViaGemini } = await load();
    await expect(generateManagerReplyViaGemini(baseRequest)).rejects.toThrow(/empty/i);
  });

  it("truncates pathologically long output to the hard cap", async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => okReply("x".repeat(5_000)));
    vi.stubGlobal("fetch", fetchMock);

    const { generateManagerReplyViaGemini } = await load();
    const reply = await generateManagerReplyViaGemini(baseRequest);
    expect(reply.length).toBeLessThanOrEqual(2_000);
  });
});
