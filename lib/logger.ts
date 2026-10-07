import pino from 'pino';

// ---------------------------------------------------------------------------
// Structured logging
// ---------------------------------------------------------------------------
// This is server-side only. The existing UI stays client-side and unchanged.
// Logs include a request/correlation id when available so Supabase operations
// and rate-limit decisions can be traced across serverless invocations.
// ---------------------------------------------------------------------------

const isDev = process.env.NODE_ENV !== 'production';

let _logger: pino.Logger | null = null;

export function getLogger(): pino.Logger {
  if (_logger) return _logger;

  _logger = pino({
    name: 'passion-discovery-engine',
    level: process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
    ...(isDev
      ? {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          },
        }
      : {}),
    base: {
      env: process.env.NODE_ENV,
      app: 'passion-discovery-engine',
    },
  });

  return _logger;
}

export const logger = getLogger();
export type Logger = pino.Logger;

/** Create a child logger with stable bindings for a given request/operation. */
export function childLogger(logger: pino.Logger, bindings: Record<string, unknown>): pino.Logger {
  return logger.child(bindings);
}
