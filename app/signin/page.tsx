"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { ArrowRight, Close } from "@/components/icons";

export default function SignIn() {
  const [showNotice, setShowNotice] = useState(false);
  const signInButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!showNotice) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowNotice(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [showNotice]);

  const closeNotice = () => {
    setShowNotice(false);
    window.requestAnimationFrame(() => signInButtonRef.current?.focus());
  };

  return (
    <>
      <AuthShell title="Welcome back" subtitle="Sign in to continue your career exploration.">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setShowNotice(true);
          }}
          className="space-y-4"
        >
          <label className="block">
            <span className="text-sm font-medium text-ink">Email</span>
            <input type="email" required placeholder="you@example.com" className="input mt-1.5" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">Password</span>
            <input type="password" required placeholder="••••••••" className="input mt-1.5" />
          </label>
          <button ref={signInButtonRef} type="submit" className="btn btn-primary btn-lg w-full">
            Sign in <ArrowRight width={18} height={18} />
          </button>
        </form>
        <p className="mt-6 text-sm text-ink-muted">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-brand-600 link-underline">
            Create an account
          </Link>
        </p>
      </AuthShell>

      {showNotice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeNotice();
          }}
        >
          <section
            aria-labelledby="signin-notice-title"
            aria-describedby="signin-notice-description"
            aria-modal="true"
            className="w-full max-w-md rounded-3xl border border-sky-100 bg-surface p-6 shadow-2xl sm:p-8"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                <ArrowRight width={20} height={20} />
              </span>
              <button
                type="button"
                onClick={closeNotice}
                autoFocus
                aria-label="Close sign-in notice"
                className="rounded-full p-2 text-ink-muted transition hover:bg-sky-50 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
              >
                <Close width={18} height={18} />
              </button>
            </div>
            <h2 id="signin-notice-title" className="display mt-5 text-2xl font-semibold">
              Sign-in is coming soon
            </h2>
            <p id="signin-notice-description" className="mt-3 text-sm leading-relaxed text-ink-muted">
              This is currently a UI prototype, so it can’t create or verify accounts yet.
              Your details weren’t sent or saved. Account sign-in will be available after
              authentication is connected.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={closeNotice} className="btn btn-outline btn-md">
                Close
              </button>
              <Link href="/careers" className="btn btn-primary btn-md">
                Explore careers <ArrowRight width={16} height={16} />
              </Link>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
