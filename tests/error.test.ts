import { describe, it, expect } from "vitest";
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  RateLimitedError,
  ConfigurationError,
  ExternalServiceError,
  sanitizeError,
} from "@/lib/error";

describe("AppError", () => {
  it("serializes to the API-safe shape", () => {
    const err = new AppError("database_error", "Unable to load session", 500, "Something went wrong");
    expect(err.toJSON()).toEqual({
      error: {
        code: "database_error",
        message: "Something went wrong",
        statusCode: 500,
      },
    });
  });

  it("includes details when provided", () => {
    const err = new AppError("validation_error", "bad input", 400, "bad input", { field: "email" });
    expect(err.toJSON().error.details).toEqual({ field: "email" });
  });

  it("falls back to the internal message when no public message is set", () => {
    const err = new AppError("internal", "stack detail", 500);
    expect(err.toJSON().error.message).toBe("stack detail");
  });
});

describe("typed subclasses", () => {
  it("NotFoundError maps to 404", () => {
    const err = new NotFoundError("Session", "sess_123");
    expect(err.statusCode).toBe(404);
    expect(err.toJSON().error.details).toEqual({ resource: "Session", identifier: "sess_123" });
  });

  it("UnauthorizedError maps to 401", () => {
    expect(new UnauthorizedError().statusCode).toBe(401);
  });

  it("ValidationError maps to 400", () => {
    expect(new ValidationError("nope").statusCode).toBe(400);
  });

  it("RateLimitedError maps to 429", () => {
    expect(new RateLimitedError().statusCode).toBe(429);
  });

  it("ConfigurationError maps to 500 with a generic public message", () => {
    const err = new ConfigurationError("SUPABASE_URL missing");
    expect(err.statusCode).toBe(500);
    expect(err.toJSON().error.message).toBe("The server is misconfigured");
  });

  it("ExternalServiceError names the failing service", () => {
    const err = new ExternalServiceError("gemini", "boom", 502);
    expect(err.statusCode).toBe(502);
    expect(err.toJSON().error.details).toEqual({ service: "gemini" });
  });
});

describe("sanitizeError", () => {
  it("passes AppErrors through with their public message", () => {
    const err = new UnauthorizedError("must sign in");
    expect(sanitizeError(err)).toEqual({
      code: "unauthorized",
      message: "must sign in",
      statusCode: 401,
    });
  });

  it("reduces unknown errors to a generic 500 (no stack or internals leak)", () => {
    const out = sanitizeError(new Error("connect ECONNREFUSED 10.0.0.1:5432 at /srv/secret"));
    expect(out).toEqual({ code: "internal_error", message: "Something went wrong", statusCode: 500 });
  });

  it("keeps a code when the unknown error carries one", () => {
    const out = sanitizeError({ code: "weird", message: "odd failure" });
    expect(out.code).toBe("weird");
    expect(out.statusCode).toBe(500);
  });
});
