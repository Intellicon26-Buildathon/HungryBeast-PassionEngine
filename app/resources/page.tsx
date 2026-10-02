"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Bulb, ArrowRight, Globe } from "@/components/icons";

type Resource = {
  title: string;
  provider: string;
  description: string;
  skill: string;
  minutes: number;
};

const RESOURCES: Resource[] = [
  { title: "How to frame a problem before solving it", provider: "Reflection guide", skill: "Problem framing", minutes: 6, description: "A short method for turning a vague problem into clear, answerable questions." },
  { title: "Spotting evidence vs. assumption", provider: "Analytical thinking", skill: "Analytical thinking", minutes: 8, description: "Practical ways to label what you actually know versus what you're guessing." },
  { title: "Reading retention & cohort charts", provider: "Data basics", skill: "Analytical thinking", minutes: 10, description: "What retention curves and cohorts are, and how to avoid over-reading them." },
  { title: "Interviewing users without leading them", provider: "User research", skill: "User empathy", minutes: 9, description: "Question patterns that surface real user needs instead of the answer you want." },
  { title: "Writing a decision-ready recommendation", provider: "Communication", skill: "Communication", minutes: 7, description: "Structure a recommendation leaders can act on in a single read." },
  { title: "Designing a small, testable experiment", provider: "Product skills", skill: "Problem framing", minutes: 8, description: "Pick the smallest test that would actually change your mind." },
];

const SKILLS = ["All skills", "Problem framing", "Analytical thinking", "User empathy", "Communication"];

export default function ResourcesPage() {
  const [skill, setSkill] = useState("All skills");
  const list = RESOURCES.filter((r) => skill === "All skills" || r.skill === skill);

  return (
    <>
      <SiteHeader />
      <main className="container-px py-12">
        <div className="max-w-2xl">
          <span className="eyebrow"><Bulb width={15} height={15} /> Learning resources</span>
          <h1 className="display mt-4 text-4xl font-semibold sm:text-5xl">
            Close the gap you just found
          </h1>
          <p className="mt-3 text-ink-muted">
            Curated, human-reviewed resources matched to the skills your
            simulations observe. Short enough to actually finish.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {SKILLS.map((s) => (
            <button
              key={s}
              onClick={() => setSkill(s)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                skill === s ? "bg-ink text-white" : "border border-line bg-surface text-ink-muted hover:border-ink/20"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((r) => (
            <div key={r.title} className="group flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-card transition hover:-translate-y-1 hover:shadow-lift">
              <div className="flex items-center justify-between">
                <span className="chip">{r.skill}</span>
                <span className="text-xs text-ink-faint">{r.minutes} min</span>
              </div>
              <h3 className="mt-3 font-bold text-ink">{r.title}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-muted">{r.description}</p>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                <span className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <Globe width={13} height={13} /> {r.provider}
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                  Open <ArrowRight width={15} height={15} className="transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-ink-faint">
          Prototype note: resources are illustrative. In production each URL is
          reviewed before it&apos;s added, and matched to your observed skills.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
