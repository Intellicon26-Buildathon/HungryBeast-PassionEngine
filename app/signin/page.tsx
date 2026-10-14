"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { PrototypeNotice } from "@/components/PrototypeNotice";
import { ArrowRight } from "@/components/icons";
import * as api from "@/lib/api";

/** Only allow same-site relative redirects (blocks `//evil.com` tricks). */
function safeNext(raw: string | null): string {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard";
}

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [next, setNext] = useState("/dashboard");

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    setNext(safeNext(qs.get("next")));
    if (qs.get("error") === "auth_callback_failed") {
      setError("That sign-in link didn't work or has expired. Please sign in again.");
    }
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.signIn(email.trim(), password);
      // Full navigation so the whole app (and AuthLayout) picks up the new
      // auth cookies the server just set.
      window.location.assign(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign you in.");
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue your career exploration.">
      {!api.backendEnabled ? (
        <PrototypeNotice />
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-ink">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input mt-1.5"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input mt-1.5"
            />
          </label>
          {error && (
            <p role="alert" className="rounded-xl bg-accent-soft px-3 py-2 text-sm text-accent">
              {error}
            </p>
          )}
          <button type="submit" disabled={busy} className="btn btn-primary btn-lg w-full">
            {busy ? "Signing in…" : <>Sign in <ArrowRight width={18} height={18} /></>}
          </button>
        </form>
      )}
      <p className="mt-6 text-sm text-ink-muted">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-brand-600 link-underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
