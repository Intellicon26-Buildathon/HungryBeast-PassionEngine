"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { listSessions, listEvaluations } from "@/lib/store";
import { getScenario, getCareer, CAREERS } from "@/lib/scenarios";
import type { Session, Evaluation } from "@/lib/types";
import { CareerCard } from "@/components/CareerCard";
import {
  ArrowRight, Chart, Target, Briefcase, Clock, Compass, CheckCircle,
} from "@/components/icons";

export default function Dashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [evals, setEvals] = useState<Evaluation[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = () => {
      setSessions(listSessions());
      setEvals(listEvaluations());
      setReady(true);
    };
    load();
    window.addEventListener("pde:store", load);
    return () => window.removeEventListener("pde:store", load);
  }, []);

  const completed = sessions.filter((s) => s.status === "completed");
  const active = sessions.find((s) => s.status === "active" && s.turns.length > 1);
  const careersExplored = new Set(completed.map((s) => s.careerSlug)).size;
  const skillsObserved = new Set(evals.flatMap((e) => e.observedSkills.map((k) => k.id))).size;

  const hasAnything = sessions.length > 0;

  return (
    <>
      <SiteHeader />
      <main className="container-px py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow"><Chart width={15} height={15} /> Your dashboard</span>
            <h1 className="display mt-3 text-4xl font-semibold">Career exploration</h1>
            <p className="mt-2 text-ink-muted">
              Everything you&apos;ve experienced, saved to your account.
            </p>
          </div>
          <Link href="/careers" className="btn btn-primary btn-md self-start sm:self-auto">
            Explore more <ArrowRight width={16} height={16} />
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile icon={<CheckCircle width={18} height={18} />} value={completed.length} label="Simulations completed" />
          <StatTile icon={<Briefcase width={18} height={18} />} value={careersExplored} label="Careers experienced" />
          <StatTile icon={<Target width={18} height={18} />} value={skillsObserved} label="Skills observed" />
          <StatTile icon={<Compass width={18} height={18} />} value={CAREERS.length} label="Careers available" />
        </div>

        {!ready ? null : !hasAnything ? (
          <EmptyState />
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-start">
            <div className="space-y-6">
              {active && (
                <section>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-ink-faint">In progress</h2>
                  <ResumeCard session={active} />
                </section>
              )}

              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider text-ink-faint">
                  Completed simulations
                </h2>
                {completed.length === 0 ? (
                  <p className="mt-3 rounded-2xl border border-dashed border-line bg-surface p-6 text-sm text-ink-muted">
                    You haven&apos;t finished a simulation yet. Your results will appear
                    here — and stay here after you refresh.
                  </p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {completed.map((s) => {
                      const ev = evals.find((e) => e.sessionId === s.id);
                      return <CompletedRow key={s.id} session={s} ev={ev} />;
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* Suggested next */}
            <aside className="lg:sticky lg:top-24">
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink-faint">
                Keep exploring
              </h2>
              <div className="mt-3">
                <CareerCard career={CAREERS[1]} />
              </div>
              <p className="mt-4 text-xs leading-relaxed text-ink-faint">
                More simulations are on the way. Each one adds new observed skills
                to your profile.
              </p>
            </aside>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

function StatTile({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="card p-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        {icon}
      </span>
      <p className="display mt-4 text-3xl font-semibold text-ink">{value}</p>
      <p className="mt-0.5 text-sm text-ink-muted">{label}</p>
    </div>
  );
}

function ResumeCard({ session }: { session: Session }) {
  const scenario = getScenario(session.scenarioSlug);
  const career = getCareer(session.careerSlug);
  const total = scenario?.tasks.length ?? 5;
  const pct = Math.round((session.currentTaskIndex / total) * 100);
  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-brand-200 bg-brand-50 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-brand-ink">{career?.title ?? "Simulation"}</p>
          <p className="text-sm text-brand-700">{scenario?.company} · {pct}% complete</p>
        </div>
        <Link
          href={`/simulate/${session.careerSlug}/run?session=${session.id}`}
          className="btn btn-primary btn-md"
        >
          Resume <ArrowRight width={16} height={16} />
        </Link>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function CompletedRow({ session, ev }: { session: Session; ev?: Evaluation }) {
  const career = getCareer(session.careerSlug);
  const total = ev ? ev.criteria.reduce((s, c) => s + c.score, 0) : null;
  const max = ev ? ev.criteria.reduce((s, c) => s + c.maxScore, 0) : null;
  const when = session.completedAt
    ? new Date(session.completedAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })
    : "";
  return (
    <Link
      href={`/evaluation/${session.id}`}
      className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:shadow-card"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-soft text-teal">
          <CheckCircle width={20} height={20} />
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{career?.title ?? "Simulation"}</p>
          <p className="flex items-center gap-2 text-xs text-ink-muted">
            <Clock width={12} height={12} /> {when}
            {ev && <> · {ev.observedSkills.length} skills observed</>}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {total != null && (
          <span className="rounded-lg bg-canvas px-2.5 py-1 text-sm font-bold text-ink">
            {total}<span className="text-ink-faint">/{max}</span>
          </span>
        )}
        <ArrowRight width={16} height={16} className="text-ink-faint" />
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="mt-10 rounded-3xl border border-dashed border-line bg-surface p-12 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <Compass width={26} height={26} />
      </span>
      <h2 className="display mt-5 text-2xl font-semibold">No simulations yet</h2>
      <p className="mx-auto mt-2 max-w-md text-ink-muted">
        Experience your first job and your results — skills, evidence and feedback —
        will be saved right here.
      </p>
      <Link href="/careers/product-manager" className="btn btn-primary btn-lg mx-auto mt-6">
        Start the Product Manager simulation <ArrowRight width={18} height={18} />
      </Link>
    </div>
  );
}
