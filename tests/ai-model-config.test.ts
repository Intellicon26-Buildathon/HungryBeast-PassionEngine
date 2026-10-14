import { describe, expect, it } from "vitest";
import { resolveAiModel } from "@/lib/config";

describe("resolveAiModel", () => {
  it("uses the supported default when no model is configured", () => {
    expect(resolveAiModel(undefined)).toEqual({ model: "gemini-3.8-flash" });
  });

  it("preserves a full Gemini model ID", () => {
    expect(resolveAiModel("gemini-3.8-flash")).toEqual({
      model: "gemini-3.8-flash",
    });
  });

  it("falls back with an explicit warning for a model version shorthand", () => {
    const result = resolveAiModel("1.5");

    expect(result.model).toBe("gemini-3.8-flash");
    expect(result.warning).toContain("AI_MODEL must be a full Gemini model ID");
  });

  it("ignores surrounding whitespace around a valid model ID", () => {
    expect(resolveAiModel(" gemini-3.8-flash ")).toEqual({
      model: "gemini-3.8-flash",
    });
  });
});
