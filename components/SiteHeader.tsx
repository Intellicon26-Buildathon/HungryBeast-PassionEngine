"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "./AuthLayout";
import * as api from "@/lib/api";
import { Logo } from "./Logo";
import { Menu, Close } from "./icons";

const NAV = [
  { href: "/careers", label: "Explore careers" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/#how", label: "How it works" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const signOut = async () => {
    try {
      await api.signOut();
    } finally {
      // Full reload clears every piece of client state tied to the account.
      window.location.assign("/");
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-canvas/80 backdrop-blur-md">
      <div className="container-px flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-ink-muted transition hover:bg-black/[0.04] hover:text-ink"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link href="/settings" className="max-w-[12rem] truncate px-2 text-sm text-ink-muted hover:text-ink" title={user.email ?? ""}>
                {(user.user_metadata?.display_name as string | undefined) || user.email}
              </Link>
              <button onClick={signOut} className="btn btn-ghost btn-md">
                Sign out
              </button>
            </>
          ) : (
            <Link href="/signin" className="btn btn-ghost btn-md">
              Sign in
            </Link>
          )}
          <Link href="/careers" className="btn btn-primary btn-md">
            Start exploring
          </Link>
        </div>
        <button
          className="btn btn-ghost btn-md md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {open ? <Close /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="border-t border-line bg-canvas md:hidden">
          <div className="container-px flex flex-col gap-1 py-3">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink"
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              {user ? (
                <button className="btn btn-outline btn-md flex-1" onClick={signOut}>
                  Sign out
                </button>
              ) : (
                <Link href="/signin" className="btn btn-outline btn-md flex-1" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
              )}
              <Link href="/careers" className="btn btn-primary btn-md flex-1" onClick={() => setOpen(false)}>
                Start
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
