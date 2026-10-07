"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { Shield } from "./icons";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  supabase: SupabaseClient | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthLayout");
  }
  return ctx;
}

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    let mounted = true;

    // Prototype mode: no auth backend configured — render immediately.
    if (!supabase) {
      setLoading(false);
      return;
    }

    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (mounted) {
        setUser(data.user ?? null);
        setLoading(false);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === "SIGNED_IN") {
        setUser(session?.user ?? null);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      } else if (event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-ink-muted">
        <div className="text-center">
          <Shield className="mx-auto mb-3 text-brand-500" width={32} height={32} />
          <p className="text-sm">Loading your session…</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, supabase, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
