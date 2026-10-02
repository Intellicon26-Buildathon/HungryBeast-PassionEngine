"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ArrowRight, Check } from "@/components/icons";

const INTERESTS = [
  "Technology", "Design", "Business", "Data & analytics",
  "Engineering", "Marketing", "Healthcare", "Education",
  "Finance", "Media & content",
];
const LANGUAGES = ["English", "සිංහල (Sinhala)", "தமிழ் (Tamil)"];

export default function Onboarding() {
  const router = useRouter();
  const [picked, setPicked] = useState<string[]>([]);
  const [lang, setLang] = useState("English");

  const toggle = (i: string) =>
    setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));

  return (
    <main className="min-h-screen bg-canvas">
      <div className="container-narrow py-10">
        <Logo />
        <div className="mt-10">
          <p className="eyebrow">Step 1 of 1 · Optional</p>
          <h1 className="display mt-3 text-4xl font-semibold">
            What are you curious about?
          </h1>
          <p className="mt-3 text-ink-muted">
            Pick a few areas and we&apos;ll surface relevant simulations first. You
            can change these any time — and you can skip straight to exploring.
          </p>

          <div className="mt-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink-faint">
              Interest areas
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {INTERESTS.map((i) => {
                const on = picked.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => toggle(i)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition ${
                      on
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-line bg-surface text-ink-muted hover:border-ink/20"
                    }`}
                  >
                    {on && <Check width={14} height={14} />}
                    {i}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink-faint">
              Preferred language
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    lang === l
                      ? "border-ink bg-ink text-white"
                      : "border-line bg-surface text-ink-muted hover:border-ink/20"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink-faint">
              Simulations run in English for this prototype; Sinhala &amp; Tamil are
              planned.
            </p>
          </div>

          <div className="mt-10 flex items-center gap-3">
            <button onClick={() => router.push("/careers")} className="btn btn-primary btn-lg">
              Continue <ArrowRight width={18} height={18} />
            </button>
            <button onClick={() => router.push("/careers")} className="btn btn-ghost btn-lg">
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
