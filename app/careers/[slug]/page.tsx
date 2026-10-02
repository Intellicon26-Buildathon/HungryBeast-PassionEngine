import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getCareer, getScenarioForCareer, CAREERS } from "@/lib/scenarios";
import {
  ArrowRight, Clock, Signal, Target, Check, Briefcase, Message, Lock,
} from "@/components/icons";

export function generateStaticParams() {
  return CAREERS.map((c) => ({ slug: c.slug }));
}

export default function CareerDetail({ params }: { params: { slug: string } }) {
  const career = getCareer(params.slug);
  if (!career) notFound();
  const scenario = getScenarioForCareer(career.slug);

  return (
    <>
      <SiteHeader />
      <main className="container-px py-10">
        <Link href="/careers" className="text-sm font-medium text-ink-muted hover:text-ink">
          ← All careers
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_0.9fr] lg:items-start">
          {/* Left: narrative */}
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                {career.area}
              </p>
              {career.available ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-soft px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wide text-teal">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse-dot" /> Live simulation
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.05] px-2.5 py-1 text-[0.68rem] font-semibold text-ink-faint">
                  <Lock width={12} height={12} /> Coming soon
                </span>
              )}
            </div>
            <h1 className="display mt-3 text-4xl font-semibold sm:text-5xl">{career.title}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-muted">
              {career.description}
            </p>

            {scenario && (
              <div className="mt-8">
                <h2 className="text-sm font-bold uppercase tracking-wider text-ink-faint">
                  Your mission
                </h2>
                <div className="mt-3 rounded-2xl border border-line bg-surface p-5 shadow-card">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 text-white">
                      <Briefcase width={20} height={20} />
                    </span>
                    <div>
                      <p className="font-bold text-ink">{scenario.company}</p>
                      <p className="text-xs text-ink-muted">{scenario.companyTag}</p>
                    </div>
                  </div>
                  <p className="mt-4 leading-relaxed text-ink">{scenario.mission}</p>
                  <div className="mt-4 flex items-center gap-3 rounded-xl bg-brand-50 p-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                      {scenario.managerName.split(" ").map((w) => w[0]).join("")}
                    </span>
                    <p className="text-sm text-brand-ink">
                      You&apos;ll work with{" "}
                      <span className="font-semibold">{scenario.managerName}</span>,{" "}
                      {scenario.managerTitle}.
                    </p>
                  </div>
                </div>

                <h2 className="mt-8 text-sm font-bold uppercase tracking-wider text-ink-faint">
                  What you&apos;ll do
                </h2>
                <ol className="mt-3 space-y-2.5">
                  {scenario.tasks.map((t) => (
                    <li key={t.id} className="flex items-start gap-3 rounded-xl border border-line bg-surface p-3.5">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[0.72rem] font-bold text-white">
                        {t.index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-ink">{t.title}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {!scenario && (
              <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface p-6">
                <p className="text-ink-muted">
                  This simulation is in development for a future release. The
                  Product Manager simulation is fully playable now —{" "}
                  <Link href="/careers/product-manager" className="font-semibold text-brand-600 link-underline">
                    try it here
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>

          {/* Right: sticky start card */}
          <aside className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
              <div className="grid grid-cols-2 gap-4">
                <Meta icon={<Clock width={16} height={16} />} label="Duration" value={`${career.durationMin} min`} />
                <Meta icon={<Signal width={16} height={16} />} label="Difficulty" value={career.difficulty} />
              </div>
              <div className="mt-5">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-faint">
                  <Target width={14} height={14} /> Skills practised
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {career.skills.map((s) => (
                    <span key={s} className="chip">{s}</span>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-line pt-5">
                {career.available ? (
                  <Link href={`/simulate/${career.slug}`} className="btn btn-primary btn-lg w-full">
                    Start simulation <ArrowRight width={18} height={18} />
                  </Link>
                ) : (
                  <button disabled className="btn btn-primary btn-lg w-full">
                    <Lock width={16} height={16} /> Coming soon
                  </button>
                )}
                <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
                  <Check width={14} height={14} className="mt-0.5 shrink-0 text-teal" />
                  Feedback is practice-focused — evidence from your work, never a
                  permanent judgement about you.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-line bg-surface p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Message width={16} height={16} className="text-brand-600" /> Real interaction
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                The manager responds to what you actually write, then an evaluator
                scores your work against a human-written rubric.
              </p>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Meta({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-canvas p-3">
      <p className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-wider text-ink-faint">
        {icon} {label}
      </p>
      <p className="mt-1 font-bold text-ink">{value}</p>
    </div>
  );
}
