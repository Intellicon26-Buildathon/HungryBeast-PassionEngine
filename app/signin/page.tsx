"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { ArrowRight } from "@/components/icons";

export default function SignIn() {
  const router = useRouter();
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue your career exploration.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/dashboard");
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
        <button type="submit" className="btn btn-primary btn-lg w-full">
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
  );
}
