// ---------------------------------------------------------------------------
// Supabase schema types
// ---------------------------------------------------------------------------
// These types mirror the intended Supabase tables and RLS design.
// They are used by the backend, DB helpers, and future migrations/setup docs.
// The existing UI types in lib/types.ts are intentionally preserved.
// ---------------------------------------------------------------------------

/**
 * User profile row.
 *
 * Design decision: profiles live in Postgres and are linked to Supabase Auth
 * by `auth.uid()`. This gives us a clean place for future role/mentor/admin
 * flags without coupling the whole product to auth metadata.
 */
export interface Profile {
  id: string; // matches auth.users.id
  display_name: string | null;
  email: string | null;
  district: string | null;
  preferred_language: string | null;
  role: 'admin' | 'mentor' | 'user';
  agreed_to_research: boolean | null;
  agreed_to_share_results: boolean | null;
  created_at: string;
  updated_at: string;
}

/**
 * A simulation session started by a user.
 */
export interface SimulationSession {
  id: string;
  user_id: string;
  scenario_slug: string;
  career_slug: string;
  status: 'active' | 'completed' | 'abandoned';
  current_task_index: number;
  started_at: string;
  completed_at: string | null;
  updated_at: string;
}

/**
 * A single spoken turn inside a simulation session.
 */
export interface SimulationTurn {
  id: string;
  session_id: string;
  speaker: 'manager' | 'student' | 'system';
  content: string;
  task_id: string | null;
  created_at: string;
}

/**
 * An evaluation generated after a session is completed.
 */
export interface SessionEvaluation {
  id: string;
  session_id: string;
  user_id: string;
  scenario_slug: string;
  career_title: string;
  summary: string;
  criteria: Record<string, unknown>[];
  observed_skills: Record<string, unknown>[];
  strengths: string[];
  improvements: string[];
  next_steps: string[];
  limitations: string;
  created_at: string;
}

/**
 * Admin-auditable event log.
 *
 * Future-proofing only. Not required for Gate 2, but it fits the production
//  story for auth events, quota events, and AI gateway events.
 */
export interface AuditEvent {
  id: string;
  user_id: string | null;
  event_type: string;
  payload: Record<string, unknown> | null;
  created_at: string;
}
