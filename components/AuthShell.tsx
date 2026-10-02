import Link from "next/link";
import { Logo } from "./Logo";
import { Check } from "./icons";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex flex-col px-6 py-8 sm:px-10">
        <Logo />
        <div className="flex flex-1 items-center">
          <div className="mx-auto w-full max-w-sm py-10">
            <h1 className="display text-3xl font-semibold">{title}</h1>
            <p className="mt-2 text-sm text-ink-muted">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
        <p className="text-xs text-ink-faint">
          Prototype sign-in — no real account is created. In production this uses
          Supabase Auth.
        </p>
      </div>

      {/* Right: brand panel */}
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-teal/20 blur-3xl" />
        <div className="relative flex h-full flex-col justify-center px-14 text-white">
          <p className="display text-4xl font-semibold leading-tight">
            &ldquo;I didn&apos;t know what a Product Manager actually did — until I
            was one for fifteen minutes.&rdquo;
          </p>
          <ul className="mt-10 space-y-3 text-work-muted">
            {[
              "Step into real, bite-sized job simulations",
              "Work with an AI manager that responds to you",
              "Get evidence-based feedback, saved to your dashboard",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal/20 text-teal">
                  <Check width={14} height={14} />
                </span>
                <span className="text-sm">{t}</span>
              </li>
            ))}
          </ul>
          <div className="mt-12">
            <Link href="/careers" className="text-sm font-semibold text-white/80 underline underline-offset-4 hover:text-white">
              Skip and explore careers →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
