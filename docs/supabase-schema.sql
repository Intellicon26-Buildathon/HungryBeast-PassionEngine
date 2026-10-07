-- ===========================================================================
-- Passion Discovery Engine — Supabase schema
-- ===========================================================================
-- Run this in your Supabase SQL editor, or adapt it into migrations.
--
-- Design notes:
--  - profiles.linked to auth.users by id = auth.uid()
--  - simulation_sessions, simulation_turns, session_evaluations are
--    user-scoped via RLS on user_id
--  - A future admin/mentor role model is prepared via profiles.role and a
--    limited admin helper in lib/db/index.ts without breaking current flows
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id	text primary key, -- auth.users.id
  display_name	text,
  email	text,
  district	text,
  preferred_language	text,
  role	text not null default 'user' check (role in ('admin','mentor','user')),
  agreed_to_research	boolean,
  agreed_to_share_results	boolean,
  created_at	timestamptz not null default now(),
  updated_at	timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select
  using ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Admin-only read of other profiles. Enabled later once admin roles exist.
-- create policy "Admins can read any profile"
--   on profiles for select
--   using (
--     (select role from profiles where id = auth.uid()) = 'admin'
--   );

-- ---------------------------------------------------------------------------
-- simulation_sessions
-- ---------------------------------------------------------------------------
create table if not exists simulation_sessions (
  id	gen_random_uuid() primary key,
  user_id	text not null references auth.users(id),
  scenario_slug	text not null,
  career_slug	text not null,
  status	text not null default 'active' check (status in ('active','completed','abandoned')),
  current_task_index	integer not null default 0,
  started_at	timestamptz not null default now(),
  completed_at	timestamptz,
  updated_at	timestamptz not null default now()
);

alter table simulation_sessions enable row level security;

create policy "Users can view own sessions"
  on simulation_sessions for select
  using ( auth.uid() = user_id );

create policy "Users can create own sessions"
  on simulation_sessions for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own sessions"
  on simulation_sessions for update
  using ( auth.uid() = user_id );

create index if not exists simulation_sessions_user_id_idx on simulation_sessions(user_id);
create index if not exists simulation_sessions_status_idx on simulation_sessions(status);
create index if not exists simulation_sessions_slug_idx on simulation_sessions(scenario_slug, career_slug);

-- ---------------------------------------------------------------------------
-- simulation_turns
-- ---------------------------------------------------------------------------
create table if not exists simulation_turns (
  id	gen_random_uuid() primary key,
  session_id	uuid not null references simulation_sessions(id) on delete cascade,
  speaker	text not null check (speaker in ('manager','student','system')),
  content	text not null,
  task_id	text,
  created_at	timestamptz not null default now()
);

alter table simulation_turns enable row level security;

create policy "Users can view own turns"
  on simulation_turns for select
  using (
    exists (
      select 1 from simulation_sessions
      where simulation_sessions.id = simulation_turns.session_id
        and simulation_sessions.user_id = auth.uid()
    )
  );

create policy "Users can insert own turns"
  on simulation_turns for insert
  with check (
    exists (
      select 1 from simulation_sessions
      where simulation_sessions.id = simulation_turns.session_id
        and simulation_sessions.user_id = auth.uid()
    )
  );

create index if not exists simulation_turns_session_id_idx on simulation_turns(session_id);

-- ---------------------------------------------------------------------------
-- session_evaluations
-- ---------------------------------------------------------------------------
create table if not exists session_evaluations (
  id	gen_random_uuid() primary key,
  session_id	uuid not null references simulation_sessions(id) on delete cascade,
  user_id	text not null references auth.users(id),
  scenario_slug	text not null,
  career_title	text not null,
  summary	text not null,
  criteria	jsonb not null default '[]'::jsonb,
  observed_skills	jsonb not null default '[]'::jsonb,
  strengths	text[] not null default '{}',
  improvements	text[] not null default '{}',
  next_steps	text[] not null default '{}',
  limitations	text not null default '',
  created_at	timestamptz not null default now()
);

alter table session_evaluations enable row level security;

create policy "Users can view own evaluations"
  on session_evaluations for select
  using ( auth.uid() = user_id );

create policy "Users can insert own evaluations"
  on session_evaluations for insert
  with check ( auth.uid() = user_id );

create index if not exists session_evaluations_user_id_idx on session_evaluations(user_id);
create index if not exists session_evaluations_session_id_idx on session_evaluations(session_id);

-- ---------------------------------------------------------------------------
-- Audit log (future-proofing for admin/security/quota events)
-- ---------------------------------------------------------------------------
create table if not exists audit_events (
  id	gen_random_uuid() primary key,
  user_id	text references auth.users(id),
  event_type	text not null,
  payload	jsonb,
  created_at	timestamptz not null default now()
);

alter table audit_events enable row level security;

create policy "Service role can manage audit log"
  on audit_events for all
  using ( auth.jwt()->>'role' = 'service_role' );

create index if not exists audit_events_user_id_idx on audit_events(user_id);
create index if not exists audit_events_event_type_idx on audit_events(event_type);
create index if not exists audit_events_created_at_idx on audit_events(created_at);

-- ---------------------------------------------------------------------------
-- Useful trigger: keep profiles.updated_at in sync
-- ---------------------------------------------------------------------------
create or replace function handle_profile_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profile_updated
  before update on profiles
  for each row
  execute function handle_profile_updated_at();

-- ---------------------------------------------------------------------------
-- Useful function: notify profile insert from auth
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, email, role)
  values (
    new.id,
    new.raw_user_meta_data->>'display_name',
    new.email,
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
