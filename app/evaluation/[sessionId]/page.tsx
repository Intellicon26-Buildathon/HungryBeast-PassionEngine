"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import * as api from "@/lib/api";
import { getScenario } from "@/lib/scenarios";
import type { Evaluation, SkillLevel } from "@/lib/types";
import {
  Target, Check, ArrowRight, Shield, Bulb, Signal, Sparkle,
} from "@/components/icons";

const LEVEL_STYLE: Record<SkillLevel, { label: string; cls: string; dots: number }> = {
  emerging: { label: "Emerging", cls: "bg-amber-soft text-amber", dots: 1 },
  developing: { label: "Developing", cls: "bg-brand-50 text-brand-700", dots: 2 },
  demonstrated: { label: "Demonstrated", cls: "bg-teal-soft text-teal", dots: 3 },
};

export default function EvaluationPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const [ev, setEv] = useState<Evaluation | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .getEvaluation(sessionId)
      .then((e) => alive && setEv(e))
      .catch((err) => {
        if (api.isUnauthorized(err)) return api.redirectToSignIn();
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Couldn't load this evaluation.");
        setEv(null);
      });
    return () => {
      alive = false;
    };
  }, [sessionId]);

  if (ev === undefined) {
    return (
      <>
        <SiteHeader />
        <main className="container-narrow py-24 text-center text-ink-muted">Loading…</main>
      </>
    );
  }

  if (ev === null) {
    return (
      <>
        <SiteHeader />
        <main className="container-narrow py-20 text-center">
          <h1 className="display text-3xl font-semibold">
            {error ? "Couldn't load evaluation" : "Evaluation not found"}
          </h1>
          <p className="mt-3 text-ink-muted">
            {error ??
              (api.backendEnabled
                ? "This result doesn't exist or belongs to another account."
                : "This result may be from another device or browser.")}
          </p>
          <Link href="/careers" className="btn btn-primary btn-lg mx-auto mt-6">
            Explore careers
          </Link>
        </main>
        <SiteFooter />
      </>
    );
  }

  const totalScore = ev.criteria.reduce((s, c) => s + c.score, 0);
  const maxScore = ev.criteria.reduce((s, c) => s + c.maxScore, 0);
  const scenario = getScenario(ev.scenarioSlug);

  return (
    <>
      <SiteHeader />
      <main className="container-px py-10">
        {/* Header band */}
        <div className="relative overflow-hidden rounded-3xl border border-line bg-ink p-8 text-white shadow-lift sm:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-teal/25 blur-3xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="eyebrow text-brand-200">
                <Sparkle width={15} height={15} /> Simulation evaluation
              </span>
              <h1 className="display mt-3 text-3xl font-semibold sm:text-4xl">
                Your {ev.careerTitle} session
              </h1>
              <p className="mt-3 max-w-xl leading-relaxed text-work-muted">{ev.summary}</p>
            </div>
            <div className="shrink-0 rounded-2xl bg-white/5 p-5 text-center">
              <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-work-muted">
                Rubric total
              </p>
              <p className="display mt-1 text-4xl font-semibold text-white">
                {totalScore}
                <span className="text-xl text-work-muted">/{maxScore}</span>
              </p>
              <p className="mt-1 text-[0.7rem] text-work-muted">illustrative, not a grade</p>
            </div>
          </div>
        </div>

        <div className="no-print mt-4 flex justify-end">
          <button onClick={() => window.print()} className="btn btn-outline btn-md">
            Print or save report as PDF
          </button>
        </div>
        <p className="mt-2 text-right text-xs text-ink-faint">
          Report created {new Date(ev.createdAt).toLocaleDateString()}
        </p>

        <section className="report-section mt-8 rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-lg font-bold text-ink">Work evidence at a glance</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Each bar represents evidence from your saved answers against this scenario&apos;s rubric.
          </p>
          <div className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {ev.criteria.map((criterion) => {
              const percentage = Math.round((criterion.score / criterion.maxScore) * 100);
              return (
                <div key={criterion.id}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-semibold text-ink">{criterion.label}</p>
                    <p className="shrink-0 text-sm font-bold tabular-nums text-ink">
                      {criterion.score} / {criterion.maxScore}
                    </p>
                  </div>
                  <div
                    className="mt-2 h-2 overflow-hidden rounded-full bg-canvas"
                    role="progressbar"
                    aria-label={`${criterion.label} evidence score`}
                    aria-valuemin={0}
                    aria-valuemax={criterion.maxScore}
                    aria-valuenow={criterion.score}
                  >
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {scenario && (
          <section className="report-section mt-6 rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-lg font-bold text-ink">What this job involves</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">
              {scenario.typicalWorkday ?? scenario.context}
            </p>
            <p className="mt-2 text-xs text-ink-faint">
              {scenario.company} is a fictional workplace in this practice simulation.
            </p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <InsightList title="Typical deliverables" items={scenario.deliverables ?? []} />
              <InsightList title="People involved" items={scenario.collaborators ?? []} />
              <InsightList title="Trade-offs in the role" items={scenario.tradeoffs ?? []} />
            </div>
          </section>
        )}

        <div className="report-section mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.9fr] lg:items-start">
          {/* Left: criteria + evidence */}
          <div className="space-y-6">
            <section className="report-section card p-6">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-ink-faint">
                <Signal width={15} height={15} /> Criterion feedback
              </h2>
              <div className="mt-5 space-y-5">
                {ev.criteria.map((c) => (
                  <div key={c.id}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-ink">{c.label}</p>
                      <span className="text-sm font-bold text-ink">
                        {c.score}<span className="text-ink-faint">/{c.maxScore}</span>
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-canvas">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{ width: `${(c.score / c.maxScore) * 100}%` }}
                      />
                    </div>
                    <p className="mt-2 rounded-lg bg-canvas px-3 py-2 text-xs italic leading-relaxed text-ink-muted">
                      {c.evidence}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                      <span className="font-semibold text-ink">Feedback: </span>{c.feedback}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Strengths / improvements */}
            <div className="grid gap-6 sm:grid-cols-2">
              <section className="report-section card p-6">
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-teal">
                  <Check width={15} height={15} /> Strengths
                </h2>
                <ul className="mt-4 space-y-3">
                  {ev.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-muted">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                      {s}
                    </li>
                  ))}
                </ul>
              </section>
              <section className="report-section card p-6">
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-accent">
                  <Bulb width={15} height={15} /> To work on
                </h2>
                <ul className="mt-4 space-y-3">
                  {ev.improvements.map((s, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-muted">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {s}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>

          {/* Right: skills + next */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <section className="report-section card p-6">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-ink-faint">
                <Target width={15} height={15} /> Observed skills
              </h2>
              <p className="mt-1 text-xs text-ink-faint">
                What this task showed — not a permanent trait.
              </p>
              <div className="mt-4 space-y-3">
                {ev.observedSkills.map((sk) => {
                  const st = LEVEL_STYLE[sk.level];
                  return (
                    <div key={sk.id} className="rounded-xl border border-line p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-ink">{sk.name}</p>
                        <span className={`rounded-md px-2 py-0.5 text-[0.68rem] font-bold ${st.cls}`}>
                          {st.label}
                        </span>
                      </div>
                      <div className="mt-2 flex gap-1">
                        {[1, 2, 3].map((d) => (
                          <span
                            key={d}
                            className={`h-1.5 flex-1 rounded-full ${d <= st.dots ? "bg-brand-500" : "bg-canvas"}`}
                          />
                        ))}
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-ink-muted">{sk.evidence}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="report-section card p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink-faint">
                Suggested next steps
              </h2>
              <ul className="mt-4 space-y-2.5">
                {ev.nextSteps.map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-muted">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[0.65rem] font-bold text-brand-700">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-col gap-2">
                <Link href="/dashboard" className="btn btn-primary btn-md w-full">
                  Save to dashboard <ArrowRight width={16} height={16} />
                </Link>
                <Link href="/careers" className="btn btn-outline btn-md w-full">
                  Try another career
                </Link>
              </div>
            </section>
          </div>
        </div>

        {/* Limitations */}
        <div className="report-section mt-8 flex items-start gap-3 rounded-2xl border border-line bg-surface p-5">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Shield width={16} height={16} />
          </span>
          <p className="text-sm leading-relaxed text-ink-muted">
            <span className="font-semibold text-ink">A note on this feedback. </span>
            {ev.limitations} It&apos;s AI-generated and may be imperfect — consider it
            alongside human advice and your own reflection.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function InsightList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink-muted">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}
