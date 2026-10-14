"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

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
            <NavLink
              key={n.href}
              href={n.href}
              label={n.label}
              active={n.href !== "/#how" && (pathname === n.href || pathname.startsWith(`${n.href}/`))}
            />
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
            Explore careers
          </Link>
        </div>
        <button
          className="btn btn-ghost btn-md md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? <Close /> : <Menu />}
        </button>
      </div>
      {open && (
        <div id="mobile-navigation" className="border-t border-line bg-canvas md:hidden">
          <div className="container-px flex flex-col gap-1 py-3">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                aria-current={n.href !== "/#how" && (pathname === n.href || pathname.startsWith(`${n.href}/`)) ? "page" : undefined}
                className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  n.href !== "/#how" && (pathname === n.href || pathname.startsWith(`${n.href}/`))
                    ? "bg-brand-50 text-brand-700"
                    : "text-ink hover:bg-black/[0.04]"
                }`}
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
                Explore careers
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
        active
          ? "bg-brand-50 text-brand-700"
          : "text-ink-muted hover:bg-black/[0.04] hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
}
