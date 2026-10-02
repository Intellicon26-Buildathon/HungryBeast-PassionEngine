"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { getCareer, getScenarioForCareer } from "@/lib/scenarios";
import { createSession } from "@/lib/store";
import {
  ArrowRight, Briefcase, Target, Clock, Signal, Shield, Check,
} from "@/components/icons";
import { notFound } from "next/navigation";

export default function SimulationPrep({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const career = getCareer(params.slug);
  const scenario = career ? getScenarioForCareer(career.slug) : undefined;

  if (!career) return notFound();
  if (!scenario) {
    return (
      <>
        <SiteHeader />
        <main className="container-narrow py-20 text-center">
          <h1 className="display text-3xl font-semibold">Not ready yet</h1>
          <p className="mt-3 text-ink-muted">
            This simulation is still in development.
          </p>
          <Link href="/careers" className="btn btn-primary btn-lg mx-auto mt-6">
            Back to careers
          </Link>
        </main>
      </>
    );
  }

  const enter = () => {
    const session = createSession(scenario.slug, career.slug);
    router.push(`/simulate/${career.slug}/run?session=${session.id}`);
  };

  return (
    <>
      <SiteHeader />
      <main className="container-narrow py-12">
        <Link href={`/careers/${career.slug}`} className="text-sm font-medium text-ink-muted hover:text-ink">
          ← Back to {career.title}
        </Link>

        <div className="mt-6 overflow-hidden rounded-3xl border border-line bg-ink text-white shadow-lift">
          <div className="relative p-8 sm:p-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-500/30 blur-3xl" />
            <p className="eyebrow text-brand-200">Mission briefing</p>
            <h1 className="display mt-3 text-3xl font-semibold sm:text-4xl">
              {scenario.role} at {scenario.company}
            </h1>
            <p className="mt-4 max-w-xl leading-relaxed text-work-muted">{scenario.context}</p>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-work-muted">
              <span className="inline-flex items-center gap-2"><Briefcase width={16} height={16} /> {scenario.company} · {scenario.companyTag}</span>
            </div>
          </div>

          <div className="grid gap-px bg-work-line sm:grid-cols-3">
            <InfoTile icon={<Clock width={18} height={18} />} label="Duration" value={`${career.durationMin} min`} />
            <InfoTile icon={<Signal width={18} height={18} />} label="Difficulty" value={career.difficulty} />
            <InfoTile icon={<Target width={18} height={18} />} label="Tasks" value={`${scenario.tasks.length} steps`} />
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
          {/* Manager */}
          <div className="card p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink-faint">
              Your manager
            </h2>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 font-bold text-white">
                {scenario.managerName.split(" ").map((w) => w[0]).join("")}
              </span>
              <div>
                <p className="font-bold text-ink">{scenario.managerName}</p>
                <p className="text-sm text-ink-muted">{scenario.managerTitle}, {scenario.company}</p>
              </div>
            </div>
            <p className="mt-4 rounded-xl bg-canvas p-4 text-sm leading-relaxed text-ink-muted">
              {scenario.managerName.split(" ")[0]} will give you a task, read your
              response, and reply like a real manager would — pushing you to be
              sharper. There are no trick questions.
            </p>
          </div>

          {/* Task sequence */}
          <div className="card p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink-faint">
              The task sequence
            </h2>
            <ol className="mt-3 space-y-2">
              {scenario.tasks.map((t) => (
                <li key={t.id} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[0.72rem] font-bold text-brand-700">
                    {t.index + 1}
                  </span>
                  <span className="text-sm text-ink">{t.title}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Expectations / consent */}
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-soft text-teal">
              <Shield width={16} height={16} />
            </span>
            <p className="max-w-xl text-sm leading-relaxed text-ink-muted">
              This is practice. Your answers are private to you, feedback is tied
              to a rubric, and nothing here decides your future. Please don&apos;t
              share sensitive personal information in your answers.
            </p>
          </div>
          <button onClick={enter} className="btn btn-primary btn-lg shrink-0">
            Enter the workplace <ArrowRight width={18} height={18} />
          </button>
        </div>
      </main>
    </>
  );
}

function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 bg-ink px-6 py-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-work-text">
        {icon}
      </span>
      <div>
        <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-work-muted">{label}</p>
        <p className="font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
