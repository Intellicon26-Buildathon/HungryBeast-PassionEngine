import { describe, it, expect } from "vitest";
import {
  signUpSchema,
  signInSchema,
  createSessionSchema,
  addTurnSchema,
  completeSessionSchema,
} from "@/lib/validation";

describe("auth validation", () => {
  it("accepts a valid signup", () => {
    const parsed = signUpSchema.parse({
      displayName: "Sanduni",
      email: "sanduni@example.lk",
      password: "password123",
    });
    expect(parsed.displayName).toBe("Sanduni");
  });

  it("rejects a signup with a short password", () => {
    expect(() =>
      signUpSchema.parse({ displayName: "S", email: "s@example.lk", password: "short" })
    ).toThrow();
  });

  it("rejects a signup with an invalid email", () => {
    expect(() =>
      signUpSchema.parse({ displayName: "S", email: "not-an-email", password: "password123" })
    ).toThrow();
  });

  it("rejects a signin with an empty password", () => {
    expect(() => signInSchema.parse({ email: "s@example.lk", password: "" })).toThrow();
  });
});

describe("session validation", () => {
  it("requires both slugs on session create", () => {
    expect(() => createSessionSchema.parse({ scenarioSlug: "" })).toThrow();
    expect(createSessionSchema.parse({ scenarioSlug: "pm", careerSlug: "product-manager" })).toEqual({
      scenarioSlug: "pm",
      careerSlug: "product-manager",
    });
  });

  it("only accepts known speakers on turns", () => {
    expect(() =>
      addTurnSchema.parse({ sessionId: "s1", speaker: "robot", content: "hi" })
    ).toThrow();
    expect(
      addTurnSchema.parse({ sessionId: "s1", speaker: "student", content: "my answer" }).speaker
    ).toBe("student");
  });

  it("rejects empty turn content", () => {
    expect(() =>
      addTurnSchema.parse({ sessionId: "s1", speaker: "student", content: "" })
    ).toThrow();
  });

  it("keeps the final answer optional on completion", () => {
    const parsed = completeSessionSchema.parse({ sessionId: "s1" });
    expect(parsed.finalAnswer).toBeUndefined();
  });
});
