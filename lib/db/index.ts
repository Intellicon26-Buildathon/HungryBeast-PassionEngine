import { z } from 'zod';
import { getSupabaseRouteClient, requireUser } from '../supabase/server';
import {
  SimulationSession,
  SimulationTurn,
  SessionEvaluation,
  Profile,
} from './schema';
import { logger } from '../logger';
import { NotFoundError, ForbiddenError, AppError } from '../error';
import {
  createSessionSchema,
  addTurnSchema,
  completeSessionSchema,
  listSessionsSchema,
  getSessionSchema,
  listEvaluationsSchema,
  getEvaluationSchema,
} from '../validation';

// ---------------------------------------------------------------------------
// Database helpers (server-side)
// ---------------------------------------------------------------------------
// These replace the old client-side localStorage store for the backend paths.
// The existing UI signatures are preserved elsewhere; this is where real
// Supabase reads/writes happen for the production backend.
// ---------------------------------------------------------------------------

const log = logger;

/**
 * The cookie-bound client (carries the user's JWT, so RLS applies).
 * Throws a clear configuration error when Supabase is not set up rather than
 * failing with an opaque `undefined` access.
 */
function db() {
  const client = getSupabaseRouteClient();
  if (!client) {
    throw new AppError(
      'configuration_error',
      'Supabase is not configured on this server',
      503,
      'The database backend is not configured yet.'
    );
  }
  return client;
}

// --- Profiles --------------------------------------------------------------

export async function getProfile(userId: string): Promise<Profile | null> {
  const client = db();
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    log.warn({ err: error, userId }, 'Failed to read profile');
    throw new AppError('database_error', 'Unable to load profile', 500);
  }

  return data ?? null;
}

export async function upsertProfile(
  userId: string,
  input: {
    displayName?: string;
    district?: string;
    preferredLanguage?: string;
    agreedToResearch?: boolean;
    agreedToShare?: boolean;
  }
): Promise<Profile> {
  const client = db();
  const { data, error } = await client
    .from('profiles')
    .upsert(
      {
        id: userId,
        display_name: input.displayName ?? null,
        district: input.district ?? null,
        preferred_language: input.preferredLanguage ?? null,
        agreed_to_research: input.agreedToResearch ?? null,
        agreed_to_share_results: input.agreedToShare ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
    .select('*')
    .maybeSingle();

  if (error) {
    log.warn({ err: error, userId }, 'Failed to upsert profile');
    throw new AppError('database_error', 'Unable to save profile', 500);
  }

  return data ?? {
    id: userId,
    display_name: input.displayName ?? null,
    email: null,
    district: input.district ?? null,
    preferred_language: input.preferredLanguage ?? null,
    role: 'user',
    agreed_to_research: input.agreedToResearch ?? null,
    agreed_to_share_results: input.agreedToShare ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

// --- Sessions --------------------------------------------------------------

export async function createSessionForUser(
  user: { id: string },
  input: z.infer<typeof createSessionSchema>
): Promise<SimulationSession> {
  const body = createSessionSchema.parse(input);

  const client = db();
  const { data, error } = await client
    .from('simulation_sessions')
    .insert({
      user_id: user.id,
      scenario_slug: body.scenarioSlug,
      career_slug: body.careerSlug,
      status: 'active',
      current_task_index: 0,
      started_at: new Date().toISOString(),
      completed_at: null,
      updated_at: new Date().toISOString(),
    } as Partial<SimulationSession>)
    .select()
    .single();

  if (error) {
    log.warn({ err: error, userId: user.id, slug: body.scenarioSlug }, 'Failed to create session');
    throw new AppError('database_error', 'Unable to start simulation', 500);
  }

  return data as SimulationSession;
}

export async function getSessionById(
  userId: string,
  sessionId: string
): Promise<SimulationSession> {
  const body = getSessionSchema.parse({ sessionId });

  const client = db();
  const { data, error } = await client
    .from('simulation_sessions')
    .select()
    .eq('id', body.sessionId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    log.warn({ err: error, userId, sessionId }, 'Failed to read session');
    throw new AppError('database_error', 'Unable to load session', 500);
  }

  if (!data) {
    throw new NotFoundError('Session', sessionId);
  }

  return data as SimulationSession;
}

export async function listSessionsByUser(
  userId: string,
  input: z.infer<typeof listSessionsSchema> = { limit: 50 }
): Promise<SimulationSession[]> {
  const body = listSessionsSchema.parse(input);

  const client = db();
  const { data, error } = await client
    .from('simulation_sessions')
    .select()
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(body.limit);

  if (error) {
    log.warn({ err: error, userId }, 'Failed to list sessions');
    throw new AppError('database_error', 'Unable to load sessions', 500);
  }

  return (data ?? []) as SimulationSession[];
}

export async function updateSession(
  userId: string,
  sessionId: string,
  updates: Partial<SimulationSession>
): Promise<SimulationSession> {
  await getSessionById(userId, sessionId);

  const client = db();
  const { data, error } = await client
    .from('simulation_sessions')
    .update(updates as Partial<SimulationSession>)
    .eq('id', sessionId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    log.warn({ err: error, userId, sessionId }, 'Failed to update session');
    throw new AppError('database_error', 'Unable to update session', 500);
  }

  if (!data) {
    throw new NotFoundError('Session', sessionId);
  }

  return data as SimulationSession;
}

// --- Turns -----------------------------------------------------------------

export async function addTurnToSession(
  userId: string,
  input: z.infer<typeof addTurnSchema>
): Promise<SimulationTurn> {
  const body = addTurnSchema.parse(input);

  await getSessionById(userId, body.sessionId);

  const client = db();
  const { data, error } = await client
    .from('simulation_turns')
    .insert({
      session_id: body.sessionId,
      speaker: body.speaker,
      content: body.content,
      task_id: body.taskId ?? null,
      created_at: new Date().toISOString(),
    } as Partial<SimulationTurn>)
    .select()
    .single();

  if (error) {
    log.warn({ err: error, userId, sessionId: body.sessionId }, 'Failed to add turn');
    throw new AppError('database_error', 'Unable to save response', 500);
  }

  return data as SimulationTurn;
}

export async function listTurnsBySession(
  userId: string,
  sessionId: string
): Promise<SimulationTurn[]> {
  await getSessionById(userId, sessionId);

  const client = db();
  const { data, error } = await client
    .from('simulation_turns')
    .select()
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    log.warn({ err: error, userId, sessionId }, 'Failed to list turns');
    throw new AppError('database_error', 'Unable to load session responses', 500);
  }

  return (data ?? []) as SimulationTurn[];
}

// --- Evaluations -----------------------------------------------------------

export async function saveEvaluationForSession(
  user: { id: string },
  sessionId: string,
  evaluation: Omit<SessionEvaluation, 'id' | 'user_id' | 'session_id' | 'created_at'>
): Promise<SessionEvaluation> {
  await getSessionById(user.id, sessionId);

  // The user's own cookie-bound client — RLS is the second line of defence
  // behind the ownership check above, never the service role.
  const client = db();
  const { data, error } = await client
    .from('session_evaluations')
    .insert({
      session_id: sessionId,
      user_id: user.id,
      scenario_slug: evaluation.scenario_slug,
      career_title: evaluation.career_title,
      summary: evaluation.summary,
      criteria: evaluation.criteria,
      observed_skills: evaluation.observed_skills,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
      next_steps: evaluation.next_steps,
      limitations: evaluation.limitations,
      created_at: new Date().toISOString(),
    } as Partial<SessionEvaluation>)
    .select()
    .single();

  if (error) {
    log.warn({ err: error, userId: user.id, sessionId }, 'Failed to save evaluation');
    throw new AppError('database_error', 'Unable to save evaluation', 500);
  }

  return data as SessionEvaluation;
}

export async function getEvaluationBySession(
  userId: string,
  sessionId: string
): Promise<SessionEvaluation | null> {
  const body = getEvaluationSchema.parse({ sessionId });

  const client = db();
  const { data, error } = await client
    .from('session_evaluations')
    .select()
    .eq('session_id', body.sessionId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    log.warn({ err: error, userId, sessionId }, 'Failed to read evaluation');
    throw new AppError('database_error', 'Unable to load evaluation', 500);  }

  return data as SessionEvaluation | null;
}

export async function listEvaluationsByUser(
  userId: string,
  input: z.infer<typeof listEvaluationsSchema> = { limit: 50 }
): Promise<SessionEvaluation[]> {
  const body = listEvaluationsSchema.parse(input);

  const client = db();
  const { data, error } = await client
    .from('session_evaluations')
    .select()
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(body.limit);

  if (error) {
    log.warn({ err: error, userId }, 'Failed to list evaluations');
    throw new AppError('database_error', 'Unable to load evaluations', 500);
  }

  return (data ?? []) as SessionEvaluation[];
}

// --- Admin/mentor future-proofing -----------------------------------------

/**
 * Placeholder for admin-side user management.
 * This intentionally does not expose bulk reads yet. It exists so the product
 * can grow into a mentor/admin model without changing RLS later.
 */
export async function getUserProfileById(adminUserId: string, targetUserId: string): Promise<Profile | null> {
  await requireUser();
  const admin = await getProfile(adminUserId);
  if (!admin || admin.role !== 'admin') {
    throw new ForbiddenError('Only admins can look up other user profiles.');
  }

  const client = db();
  const { data, error } = await client
    .from('profiles')
    .select()
    .eq('id', targetUserId)
    .maybeSingle();

  if (error) {
    log.warn({ err: error, adminUserId, targetUserId }, 'Failed to read target profile');
    throw new AppError('database_error', 'Unable to load profile', 500);
  }

  return data ?? null;
}
