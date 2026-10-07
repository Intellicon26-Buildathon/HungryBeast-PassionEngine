# Architecture artifacts

This folder contains the produced architecture artifacts for the backend work.

## What exists now

- `supabase-schema.sql` — intended Supabase tables, indexes, triggers, and RLS policies
- `supabase-setup-checklist.md` — production setup steps for auth, RLS, and email delivery

## What will be generated

- Archify diagrams (SVG + interactive HTML) for:
  - system architecture
  - auth flow (sign-up, sign-in, confirmation, password reset)
  - data model and RLS boundaries
  - simulation runtime flow
  - rate limiting / AI gateway flow
  - deployment view
- A consolidated architecture document/specification for the full product

These diagrams are generated after the backend scaffolding so they reflect the
final system rather than a placeholder.
