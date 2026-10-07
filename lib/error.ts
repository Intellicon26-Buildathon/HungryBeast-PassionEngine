// ---------------------------------------------------------------------------
// Application errors
// ---------------------------------------------------------------------------
// Server-only. The existing UI remains client-only and unchanged.
// These types give backends a consistent way to return structured errors
// without leaking internal details to the client.
// ---------------------------------------------------------------------------

export class AppError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly statusCode = 500,
    readonly publicMessage?: string,
    readonly details?: unknown
  ) {
    super(message);
    // Preserve the real subclass name (ValidationError, ExternalServiceError,
    // …). Do NOT call setPrototypeOf here: it would flatten every subclass
    // instance onto AppError.prototype and silently break every
    // `err instanceof Subclass` check in the codebase.
    this.name = new.target.name;
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.publicMessage ?? this.message,
        statusCode: this.statusCode,
        ...(this.details !== undefined ? { details: this.details } : {}),
      },
    };
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier: string) {
    super('not_found', `${resource} not found`, 404, `${resource} was not found`, {
      resource,
      identifier,
    });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super('unauthorized', message, 401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to do that') {
    super('forbidden', message, 403, message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super('validation_error', message, 400, message, details);
  }
}

export class RateLimitedError extends AppError {
  constructor(message = 'Too many requests. Please try again later.') {
    super('rate_limited', message, 429, message);
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string) {
    super('configuration_error', message, 500, 'The server is misconfigured', {
      message,
    });
  }
}

export class ExternalServiceError extends AppError {
  constructor(
    service: string,
    message: string,
    statusCode = 502,
    publicMessage = 'An external service failed',
    /** Transient failures (429/5xx/timeout) are safe to retry. */
    readonly retryable = true
  ) {
    super('external_service_error', message, statusCode, publicMessage, { service });
  }
}

/** Safely serialize an unknown error into an API-safe shape. */
export function sanitizeError(err: unknown): { code: string; message: string; statusCode: number } {
  if (err instanceof AppError) {
    return { code: err.code, message: err.publicMessage ?? err.message, statusCode: err.statusCode };
  }

  if (err && typeof err === 'object' && 'code' in err && 'message' in err) {
    const e = err as { code: string; message: string };
    return { code: String(e.code), message: String(e.message), statusCode: 500 };
  }

  return {
    code: 'internal_error',
    message: 'Something went wrong',
    statusCode: 500,
  };
}
