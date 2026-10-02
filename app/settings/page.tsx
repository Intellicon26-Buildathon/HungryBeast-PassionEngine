"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { resetAll } from "@/lib/store";
import { Shield, Check } from "@/components/icons";

export default function Settings() {
  const router = useRouter();
  const [consentResearch, setConsentResearch] = useState(false);
  const [consentShare, setConsentShare] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const clearData = () => {
    resetAll();
    setConfirming(false);
    router.push("/dashboard");
  };

  return (
    <>
      <SiteHeader />
      <main className="container-narrow py-12">
        <h1 className="display text-4xl font-semibold">Settings &amp; privacy</h1>
        <p className="mt-2 text-ink-muted">
          Control your profile and what happens to your data.
        </p>

        {/* Profile */}
        <section className="card mt-8 p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink-faint">Profile</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-ink">Display name</span>
              <input defaultValue="Sanduni" className="input mt-1.5" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">District (optional)</span>
              <input defaultValue="Colombo" className="input mt-1.5" />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-ink">Preferred language</span>
              <select className="input mt-1.5">
                <option>English</option>
                <option>සිංහල (Sinhala) — planned</option>
                <option>தமிழ் (Tamil) — planned</option>
              </select>
            </label>
          </div>
          <button className="btn btn-primary btn-md mt-5">Save changes</button>
        </section>

        {/* Privacy */}
        <section className="card mt-6 p-6">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-ink-faint">
            <Shield width={15} height={15} /> Privacy &amp; consent
          </h2>
          <div className="mt-4 space-y-3">
            <Toggle
              on={consentResearch}
              set={setConsentResearch}
              title="Help improve the product"
              body="Allow anonymised, aggregated use of your activity to improve simulations. Never your raw answers."
            />
            <Toggle
              on={consentShare}
              set={setConsentShare}
              title="Share results with mentors (opt-in)"
              body="Off by default. Your simulation answers are never shared with anyone unless you turn this on."
            />
          </div>
          <div className="mt-4 rounded-xl bg-canvas p-4 text-xs leading-relaxed text-ink-muted">
            We collect the minimum needed to run your simulations. We don&apos;t ask
            for national ID numbers or exact addresses, and feedback is for
            practice — not employment, admission, or suitability decisions.
          </div>
        </section>

        {/* Data controls */}
        <section className="card mt-6 border-accent/30 p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-accent">Your data</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Clear all your simulation sessions and evaluations stored on this
            device. This cannot be undone.
          </p>
          {!confirming ? (
            <button onClick={() => setConfirming(true)} className="btn btn-outline btn-md mt-4 border-accent/40 text-accent hover:bg-accent-soft">
              Clear my data
            </button>
          ) : (
            <div className="mt-4 flex items-center gap-3">
              <button onClick={clearData} className="btn btn-accent btn-md">
                Yes, delete everything
              </button>
              <button onClick={() => setConfirming(false)} className="btn btn-ghost btn-md">
                Cancel
              </button>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Toggle({
  on, set, title, body,
}: {
  on: boolean; set: (v: boolean) => void; title: string; body: string;
}) {
  return (
    <button
      onClick={() => set(!on)}
      className="flex w-full items-start gap-3 rounded-xl border border-line p-4 text-left transition hover:border-ink/15"
    >
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${
          on ? "border-brand-500 bg-brand-500 text-white" : "border-line bg-surface"
        }`}
      >
        {on && <Check width={14} height={14} />}
      </span>
      <span>
        <span className="block text-sm font-semibold text-ink">{title}</span>
        <span className="mt-0.5 block text-sm leading-relaxed text-ink-muted">{body}</span>
      </span>
    </button>
  );
}
