# Supabase setup checklist

This document is the production setup guide for the backend. It assumes you
have a Supabase project and want to enable email/password auth with
confirmation and password reset, per-user RLS, and email delivery ready for
a real SMTP/Resend provider later.

## 1. Create the schema

1. Open the Supabase SQL editor.
2. Run `docs/supabase-schema.sql`.
3. Verify that these tables exist:
   - `profiles`
   - `simulation_sessions`
   - `simulation_turns`
   - `session_evaluations`
   - `audit_events`

## 2. Configure email/password auth

1. Go to **Authentication > Providers**.
2. Enable **Email**.
3. Set **Email Auth Providers** to allow **Email + Password**.
4. Under **Email Auth**, enable:
   - **Confirm email**
   - **Enable password reset**
5. If you want this prototype to skip email confirmation for now, toggle
   **Confirm email** off in the dashboard temporarily. The app code still
   expects the production behavior to be "confirm email on".

## 3. Configure email delivery

The backend does not send email itself. Supabase sends auth emails, so email
delivery is configured in the Supabase dashboard.

For production:
1. Go to **Authentication > Email Templates**.
2. Review:
   - Welcome/confirmation email
   - Confirmation resend
   - Magic link (disabled in this app)
   - Password reset
   - Email change
3. Replace the default sender domain/routing with your real provider when
   ready (SMTP, Resend, Postmark, etc.).
4. If you use a custom domain, set it up in Supabase first so auth emails
   look legitimate.

If you want to test auth without real email in development, use the Supabase
dashboard option to **disable email confirmations** or use the service-role
client to auto-confirm test users in your test setup.

## 4. Enable Row Level Security

The SQL file enables RLS and adds user-scoped policies. After running it:

1. Go to **Authentication > Policies** for each table and confirm policies
   exist.
2. Verify these rules:
   - Users can only read/write their own profile.
   - Users can only read/write their own sessions.
   - Users can only read/write their own turns by joining through sessions.
   - Users can only read/write their own evaluations.
3. Confirm that no public read access exists on session or evaluation data.

## 5. Service role key

1. Go to **Settings > API**.
2. Copy:
   - `SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only. Do not expose it to the
   browser.

## 6. Upstash Redis for rate limiting

Rate limiting is optional until credentials are provided. When you are ready:

1. Create an Upstash Redis database.
2. Copy:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
3. Add them to your server environment.
4. Once they are set, rate limiting automatically turns on.

## 7. Recommended checks before launch

- [ ] Email confirmation is on in Supabase
- [ ] Password reset is on in Supabase
- [ ] RLS is enabled on all user tables
- [ ] `profiles.role` defaults to `user`
- [ ] Service role key is not committed
- [ ] Rate-limit Redis credentials are server-side only
- [ ] Email templates are reviewed and sender domain is set
- [ ] `APP_ORIGIN` or `NEXT_PUBLIC_API_BASE_URL` matches your deploy URL
- [ ] Auth callback URLs in Supabase include your dev and production origins

## 8. Future admin/mentor model

If you later want admins or mentors:
1. Add a few users with `profiles.role = 'admin'` via SQL or an admin tool.
2. Re-enable the commented admin read policy in the schema.
3. Extend `lib/db/index.ts` `getUserProfileById` and role checks as needed.

No current user flow depends on admin/mentor roles today.
