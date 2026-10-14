-- ===========================================================================
-- Passion Discovery Engine — Supabase schema
-- ===========================================================================
-- Paste the whole file into the Supabase SQL editor and run it. It is safe to
-- re-run: tables use IF NOT EXISTS and policies/triggers are dropped first.
--
-- Design notes:
--  - All ids are uuid so they compare directly with auth.uid() / auth.users.id.
--  - profiles.id = auth.users.id; a trigger creates the row at sign-up.
--  - simulation_sessions, simulation_turns, session_evaluations are
--    user-scoped via RLS. Deleting a session cascades to its turns and
--    evaluation (FK cascades are not subject to RLS).
--  - A future admin/mentor role model is prepared via profiles.role.
-- ===========================================================================

create extension if not exists pgcrypto; -- gen_random_uuid()

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id                       uuid primary key references auth.users(id) on delete cascade,
  display_name             text,
  email                    text,
  district                 text,
  preferred_language       text,
  role                     text not null default 'user' check (role in ('admin','mentor','user')),
  agreed_to_research       boolean,
  agreed_to_share_results  boolean,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using ( auth.uid() = id );

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id )
  with check ( auth.uid() = id );

-- Users must not promote themselves: role is only changeable by the service role.
create or replace function public.prevent_role_self_change()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role and coalesce(auth.jwt()->>'role', '') <> 'service_role' then
    raise exception 'role can only be changed by an administrator';
  end if;
  return new;
end;
$$;

drop trigger if exists on_profile_role_change on public.profiles;
create trigger on_profile_role_change
  before update on public.profiles
  for each row
  execute function public.prevent_role_self_change();

-- ---------------------------------------------------------------------------
-- simulation_sessions
-- ---------------------------------------------------------------------------
create table if not exists public.simulation_sessions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  scenario_slug       text not null,
  career_slug         text not null,
  status              text not null default 'active' check (status in ('active','completed','abandoned')),
  current_task_index  integer not null default 0,
  started_at          timestamptz not null default now(),
  completed_at        timestamptz,
  updated_at          timestamptz not null default now()
);

alter table public.simulation_sessions enable row level security;

drop policy if exists "Users can view own sessions" on public.simulation_sessions;
create policy "Users can view own sessions"
  on public.simulation_sessions for select
  using ( auth.uid() = user_id );

drop policy if exists "Users can create own sessions" on public.simulation_sessions;
create policy "Users can create own sessions"
  on public.simulation_sessions for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can update own sessions" on public.simulation_sessions;
create policy "Users can update own sessions"
  on public.simulation_sessions for update
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

drop policy if exists "Users can delete own sessions" on public.simulation_sessions;
create policy "Users can delete own sessions"
  on public.simulation_sessions for delete
  using ( auth.uid() = user_id );

create index if not exists simulation_sessions_user_id_idx on public.simulation_sessions(user_id, started_at desc);
create index if not exists simulation_sessions_status_idx on public.simulation_sessions(status);
create index if not exists simulation_sessions_slug_idx on public.simulation_sessions(scenario_slug, career_slug);

-- ---------------------------------------------------------------------------
-- simulation_turns
-- ---------------------------------------------------------------------------
create table if not exists public.simulation_turns (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.simulation_sessions(id) on delete cascade,
  speaker     text not null check (speaker in ('manager','student','system')),
  content     text not null check (char_length(content) <= 6000),
  task_id     text,
  created_at  timestamptz not null default now()
);

alter table public.simulation_turns enable row level security;

drop policy if exists "Users can view own turns" on public.simulation_turns;
create policy "Users can view own turns"
  on public.simulation_turns for select
  using (
    exists (
      select 1 from public.simulation_sessions s
      where s.id = simulation_turns.session_id
        and s.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert own turns" on public.simulation_turns;
create policy "Users can insert own turns"
  on public.simulation_turns for insert
  with check (
    exists (
      select 1 from public.simulation_sessions s
      where s.id = simulation_turns.session_id
        and s.user_id = auth.uid()
    )
  );

create index if not exists simulation_turns_session_id_idx on public.simulation_turns(session_id, created_at);

-- ---------------------------------------------------------------------------
-- session_evaluations  (one per session)
-- ---------------------------------------------------------------------------
create table if not exists public.session_evaluations (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid not null unique references public.simulation_sessions(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  scenario_slug   text not null,
  career_title    text not null,
  summary         text not null,
  criteria        jsonb not null default '[]'::jsonb,
  observed_skills jsonb not null default '[]'::jsonb,
  strengths       text[] not null default '{}',
  improvements    text[] not null default '{}',
  next_steps      text[] not null default '{}',
  limitations     text not null default '',
  created_at      timestamptz not null default now()
);

alter table public.session_evaluations enable row level security;

drop policy if exists "Users can view own evaluations" on public.session_evaluations;
create policy "Users can view own evaluations"
  on public.session_evaluations for select
  using ( auth.uid() = user_id );

drop policy if exists "Users can insert own evaluations" on public.session_evaluations;
create policy "Users can insert own evaluations"
  on public.session_evaluations for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.simulation_sessions s
      where s.id = session_evaluations.session_id
        and s.user_id = auth.uid()
    )
  );

create index if not exists session_evaluations_user_id_idx on public.session_evaluations(user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Audit log (future-proofing for admin/security/quota events)
-- ---------------------------------------------------------------------------
create table if not exists public.audit_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  event_type  text not null,
  payload     jsonb,
  created_at  timestamptz not null default now()
);

-- RLS on with no policies = only the service role (which bypasses RLS) can
-- read or write it.
alter table public.audit_events enable row level security;

create index if not exists audit_events_user_id_idx on public.audit_events(user_id);
create index if not exists audit_events_event_type_idx on public.audit_events(event_type);
create index if not exists audit_events_created_at_idx on public.audit_events(created_at);

-- ---------------------------------------------------------------------------
-- Triggers: keep updated_at fresh
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_profile_updated on public.profiles;
create trigger on_profile_updated
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

drop trigger if exists on_session_updated on public.simulation_sessions;
create trigger on_session_updated
  before update on public.simulation_sessions
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Trigger: create the profile row whenever a user signs up
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
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
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Backfill profiles for any users that signed up before this trigger existed.
insert into public.profiles (id, display_name, email, role)
select u.id, u.raw_user_meta_data->>'display_name', u.email, 'user'
from auth.users u
on conflict (id) do nothing;
