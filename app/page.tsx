import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CAREERS, getScenarioForCareer } from "@/lib/scenarios";
import type { Career, Scenario } from "@/lib/types";
import {
  ArrowRight, Compass, Briefcase, Message, Target, Sparkle,
  Shield, Check, Clock,
} from "@/components/icons";

export default function Home() {
  const careers = CAREERS.filter((career) => career.available);
  const featuredCareer = [...careers].sort(
    (first, second) => first.durationMin - second.durationMin,
  )[0];
  const featuredScenario = featuredCareer
    ? getScenarioForCareer(featuredCareer.slug)
    : undefined;
  const durations = careers.map((career) => career.durationMin);
  const shortestDuration = durations.length ? Math.min(...durations) : 0;
  const longestDuration = durations.length ? Math.max(...durations) : 0;

  return (
    <>
      <SiteHeader />
      <main>
        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 grid-texture opacity-60" />
          <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-brand-100/50 blur-3xl" />
          <div className="container-px relative grid gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
            <div className="animate-fade-up">
              <span className="eyebrow">
                <Sparkle width={15} height={15} /> Career simulation
              </span>
              <h1 className="display mt-5 text-[2.7rem] font-semibold sm:text-6xl">
                Experience the work.
                <br />
                <span className="text-brand-600">Discover yourself.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
                Try a short workplace simulation, make decisions, and get
                evidence-based feedback on the skills you demonstrate.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/careers" className="btn btn-primary btn-lg">
                  Explore careers <ArrowRight width={18} height={18} />
                </Link>
                <Link href="#how" className="btn btn-outline btn-lg">
                  How it works
                </Link>
              </div>
              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-muted">
                <Stat value={String(careers.length)} label="playable careers" />
                <Divider />
                <Stat value={`${shortestDuration}-${longestDuration} min`} label="per simulation" />
                <Divider />
                <Stat value="Evidence" label="based feedback" />
              </div>
            </div>

            <div className="animate-fade-up [animation-delay:120ms]">
              {featuredCareer && featuredScenario && (
                <ScenarioPreview career={featuredCareer} scenario={featuredScenario} />
              )}
            </div>
          </div>
        </section>

        {/* ── How it works ───────────────────────────────────── */}
        <section id="how" className="container-px scroll-mt-20 py-16">
          <div className="max-w-2xl">
            <span className="eyebrow"><Compass width={15} height={15} /> How it works</span>
            <h2 className="display mt-4 text-3xl font-semibold sm:text-4xl">
              Four steps from curious to clear
            </h2>
            <p className="mt-3 text-ink-muted">
              No lectures, no personality quiz. You learn by doing a short slice
              of the real job.
            </p>
          </div>
          <div className="mt-10 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
            <Step icon={<Compass />} title="Explore a career"
              body="Browse simulations by area, duration and the skills they practise." />
            <Step icon={<Briefcase />} title="Enter the workplace"
              body="Join a fictional company and meet your AI manager with a real mission." />
            <Step icon={<Message />} title="Do the work"
              body="Investigate, reason, and respond. The manager reacts to what you actually say." />
            <Step icon={<Target />} title="Get evidence"
              body="Receive rubric-based feedback and observed skills, saved to your dashboard." />
          </div>
        </section>

        {/* ── Principles ─────────────────────────────────────── */}
        <section id="principles" className="container-px scroll-mt-20 py-16">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <span className="eyebrow"><Shield width={15} height={15} /> Built responsibly</span>
              <h2 className="display mt-4 text-3xl font-semibold sm:text-4xl">
                Practice, not prediction
              </h2>
              <p className="mt-3 text-ink-muted">
                A simulation shows you what a job feels like and gives you
                evidence to reflect on. It never claims to decide your future.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Principle title="Evidence-based feedback"
                body="Every observation is tied to your actual response and a human-written rubric — not a vibe." />
              <Principle title="No permanent labels"
                body="                We say “in this task you demonstrated this skill,” never “you are or aren't suited to this career.”" />
              <Principle title="Your data, your control"
                body="We collect the minimum, explain what's stored, and keep your answers private to you." />
              <Principle title="Local and realistic"
                body="Scenarios use believable Sri Lankan workplace contexts, built for students after A/Ls." />
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="text-base font-bold text-ink">{value}</span>
      <span>{label}</span>
    </span>
  );
}
function Divider() {
  return <span className="hidden h-4 w-px bg-line sm:inline-block" />;
}

function Step({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="border-t border-line py-5">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          {icon}
        </span>
        <h3 className="font-bold text-ink">{title}</h3>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">{body}</p>
    </div>
  );
}

function Principle({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-soft text-teal">
          <Check width={14} height={14} />
        </span>
        <div>
          <h3 className="font-bold text-ink">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">{body}</p>
        </div>
      </div>
    </div>
  );
}

function ScenarioPreview({
  career,
  scenario,
}: {
  career: Career;
  scenario: Scenario;
}) {
  const managerInitials = scenario.managerName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
  const openingMessage = scenario.tasks[0]?.brief ?? scenario.mission;

  return (
    <article className="relative mx-auto max-w-xl rounded-3xl border border-work-line bg-work-bg p-3 shadow-lift">
      <div className="flex items-center gap-1.5 px-2 pb-3 pt-1">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-[0.7rem] font-medium text-work-muted">
          Sample conversation | {scenario.company}
        </span>
      </div>
      <div className="rounded-2xl bg-work-panel p-4 sm:p-5">
        <div className="flex items-center gap-3 border-b border-work-line pb-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
            {managerInitials}
          </span>
          <div>
            <p className="text-sm font-semibold text-work-text">{scenario.managerName}</p>
            <p className="text-[0.7rem] text-work-muted">{scenario.managerTitle}</p>
          </div>
        </div>
        <div className="mt-3 space-y-3">
          <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-work-panel2 p-3 text-[0.8rem] leading-relaxed text-work-text">
            {openingMessage}
          </div>
          <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-brand-500 p-3 text-[0.8rem] leading-relaxed text-white">
            I&apos;d start by checking the evidence, then test a focused explanation before recommending a change.
          </div>
          <p className="text-right text-[0.7rem] text-work-muted">
            Example response for the {career.title} role
          </p>
          <Link
            href={`/careers/${career.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-brand-200"
          >
            View this career <ArrowRight width={16} height={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}
