import { z } from 'zod';

// ---------------------------------------------------------------------------
// Validation schemas (server-side use)
// ---------------------------------------------------------------------------
// These mirror the Supabase schema and the existing app types as closely as
// possible so the backend can validate inbound data before it touches the DB.
// ---------------------------------------------------------------------------

// --- Auth -----------------------------------------------------------------

export const signUpSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(128, 'Display name is too long'),
  email: z
    .string()
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
  // Optional future-proofing: consent flags can be recorded server-side when
  // the onboarding screens start posting them back.
  consentsToResearch: z.boolean().optional(),
  consentsToShare: z.boolean().optional(),
});

export const signInSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'New password must be at least 8 characters'),
});

export const emailChangeRequestSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newEmail: z.string().email('Enter a valid new email address'),
});

// --- Sessions / turns / evaluations --------------------------------------

export const createSessionSchema = z.object({
  scenarioSlug: z.string().min(1, 'Simulation is required'),
  careerSlug: z.string().min(1, 'Career is required'),
});

export const addTurnSchema = z.object({
  sessionId: z.string().min(1, 'Session id is required'),
  speaker: z.enum(['manager', 'student', 'system']),
  content: z.string().min(1, 'Response cannot be empty'),
  taskId: z.string().optional(),
});

export const completeSessionSchema = z.object({
  sessionId: z.string().min(1, 'Session id is required'),
  finalAnswer: z.string().optional(),
});

export const listSessionsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50),
  cursor: z.string().optional(),
});

export const getSessionSchema = z.object({
  sessionId: z.string().min(1, 'Session id is required'),
});

export const listEvaluationsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50),
  cursor: z.string().optional(),
});

export const getEvaluationSchema = z.object({
  sessionId: z.string().min(1, 'Session id is required'),
});

// --- Admin/mentor future-proofing -----------------------------------------

export const createUserRoleSchema = z.object({
  userId: z.string().uuid('Invalid user id'),
  role: z.enum(['admin', 'mentor', 'user']).default('user'),
});

// --- Shared helpers --------------------------------------------------------

/** Strip unknown keys from untrusted input while preserving expected fields. */
export function narrow<T>(schema: z.ZodType<T>, input: unknown): T {
  return schema.parse(input);
}
