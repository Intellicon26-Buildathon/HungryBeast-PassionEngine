"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { PrototypeNotice } from "@/components/PrototypeNotice";
import { ArrowRight, Check } from "@/components/icons";
import * as api from "@/lib/api";

export default function SignUp() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSentTo, setConfirmSentTo] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { requiresConfirmation } = await api.signUp(displayName.trim(), email.trim(), password);
      if (requiresConfirmation) {
        setConfirmSentTo(email.trim());
        setBusy(false);
      } else {
        // Signed in straight away — full navigation so the auth cookies apply.
        window.location.assign("/onboarding");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your account.");
      setBusy(false);
    }
  };

  if (confirmSentTo) {
    return (
      <AuthShell title="Check your email" subtitle="One more step to activate your account.">
        <div className="rounded-2xl border border-teal/30 bg-teal-soft p-5 text-sm leading-relaxed text-ink-muted">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal text-white">
            <Check width={18} height={18} />
          </span>
          <p className="mt-3">
            We sent a confirmation link to <strong className="text-ink">{confirmSentTo}</strong>.
            Open it on this device to finish signing up — it brings you straight back here.
          </p>
        </div>
        <p className="mt-6 text-sm text-ink-muted">
          Already confirmed?{" "}
          <Link href="/signin" className="font-semibold text-brand-600 link-underline">
            Sign in
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Two minutes to set up. Then go experience a real job."
    >
      {!api.backendEnabled ? (
        <PrototypeNotice />
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-ink">Display name</span>
            <input
              required
              maxLength={128}
              autoComplete="nickname"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Sanduni"
              className="input mt-1.5"
            />
          </label>
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
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="input mt-1.5"
            />
          </label>
          <p className="text-xs leading-relaxed text-ink-faint">
            By continuing you agree to our practice-focused, privacy-first use of
            your data. We never sell your answers or expose them to employers.
          </p>
          {error && (
            <p role="alert" className="rounded-xl bg-accent-soft px-3 py-2 text-sm text-accent">
              {error}
            </p>
          )}
          <button type="submit" disabled={busy} className="btn btn-primary btn-lg w-full">
            {busy ? "Creating account…" : <>Create account <ArrowRight width={18} height={18} /></>}
          </button>
        </form>
      )}
      <p className="mt-6 text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/signin" className="font-semibold text-brand-600 link-underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
