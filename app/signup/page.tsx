"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { ArrowRight } from "@/components/icons";

export default function SignUp() {
  const router = useRouter();
  return (
    <AuthShell
      title="Create your account"
      subtitle="Two minutes to set up. Then go experience a real job."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/onboarding");
        }}
        className="space-y-4"
      >
        <label className="block">
          <span className="text-sm font-medium text-ink">Display name</span>
          <input required placeholder="e.g. Sanduni" className="input mt-1.5" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Email</span>
          <input type="email" required placeholder="you@example.com" className="input mt-1.5" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Password</span>
          <input type="password" required placeholder="Choose a password" className="input mt-1.5" />
        </label>
        <p className="text-xs leading-relaxed text-ink-faint">
          By continuing you agree to our practice-focused, privacy-first use of
          your data. We never sell your answers or expose them to employers.
        </p>
        <button type="submit" className="btn btn-primary btn-lg w-full">
          Create account <ArrowRight width={18} height={18} />
        </button>
      </form>
      <p className="mt-6 text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/signin" className="font-semibold text-brand-600 link-underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
