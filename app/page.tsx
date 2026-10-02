import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CAREERS } from "@/lib/scenarios";
import {
  ArrowRight, Compass, Briefcase, Message, Target, Sparkle,
  Shield, Signal, Check, Clock,
} from "@/components/icons";

export default function Home() {
  const pm = CAREERS[0];
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
                <Sparkle width={15} height={15} /> AI career simulations
              </span>
              <h1 className="display mt-5 text-[2.7rem] font-semibold sm:text-6xl">
                Experience the work.
                <br />
                <span className="text-brand-600">Discover yourself.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
                Most career advice just tells you what to pick. We let you{" "}
                <span className="font-semibold text-ink">step into the job</span> —
                solve a real problem, work with an AI manager, and get honest,
                evidence-based feedback on what you actually did.
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
                <Stat value="5" label="career paths" />
                <Divider />
                <Stat value="~15 min" label="per simulation" />
                <Divider />
                <Stat value="Evidence" label="based feedback" />
              </div>
            </div>

            {/* Hero preview: a glimpse of the virtual workplace */}
            <div className="animate-fade-up [animation-delay:120ms]">
              <HeroWorkplacePreview />
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
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Step n="01" icon={<Compass />} title="Explore a career"
              body="Browse simulations by area, duration and the skills they practise." />
            <Step n="02" icon={<Briefcase />} title="Enter the workplace"
              body="Join a fictional company and meet your AI manager with a real mission." />
            <Step n="03" icon={<Message />} title="Do the work"
              body="Investigate, reason, and respond. The manager reacts to what you actually say." />
            <Step n="04" icon={<Target />} title="Get evidence"
              body="Receive rubric-based feedback and observed skills — saved to your dashboard." />
          </div>
        </section>

        {/* ── Featured simulation ────────────────────────────── */}
        <section className="container-px py-10">
          <div className="relative overflow-hidden rounded-3xl border border-line bg-ink p-8 text-white sm:p-12">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-soft/15 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wide text-teal">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse-dot" /> Live now
                </span>
                <h2 className="display mt-4 text-3xl font-semibold sm:text-4xl">
                  Be a Product Manager for 15 minutes
                </h2>
                <p className="mt-3 max-w-xl text-work-muted">
                  NovaTech just lost 18% of its returning users. Your manager
                  Maya needs a clear head on the problem. Investigate, form a
                  hypothesis, and recommend what the team should do next.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {pm.skills.map((s) => (
                    <span key={s} className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium text-white/90">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4 text-sm text-work-muted">
                  <span className="inline-flex items-center gap-1.5"><Clock width={15} height={15} /> {pm.durationMin} min</span>
                  <span className="inline-flex items-center gap-1.5"><Signal width={15} height={15} /> {pm.difficulty}</span>
                </div>
                <Link href={`/careers/${pm.slug}`} className="btn btn-accent btn-lg">
                  Start this simulation <ArrowRight width={18} height={18} />
                </Link>
              </div>
            </div>
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
                body="We say “in this task you demonstrated…”, never “you are / aren't suited to this career.”" />
              <Principle title="Your data, your control"
                body="We collect the minimum, explain what's stored, and keep your answers private to you." />
              <Principle title="Local and realistic"
                body="Scenarios use believable Sri Lankan workplace contexts, built for students after A/Ls." />
            </div>
          </div>
        </section>

        {/* ── Final CTA ──────────────────────────────────────── */}
        <section className="container-px pb-8">
          <div className="rounded-3xl border border-line bg-surface p-10 text-center shadow-card sm:p-14">
            <h2 className="display mx-auto max-w-2xl text-3xl font-semibold sm:text-4xl">
              Stop guessing which career fits. Go and try one.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-ink-muted">
              Your first simulation takes about 15 minutes and needs nothing but
              curiosity.
            </p>
            <Link href="/careers" className="btn btn-primary btn-lg mx-auto mt-7">
              Explore careers <ArrowRight width={18} height={18} />
            </Link>
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

function Step({ n, icon, title, body }: { n: string; icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="card p-5 transition hover:-translate-y-1 hover:shadow-lift">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          {icon}
        </span>
        <span className="text-xs font-bold text-ink-faint">{n}</span>
      </div>
      <h3 className="mt-4 font-bold text-ink">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{body}</p>
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

function HeroWorkplacePreview() {
  return (
    <div className="relative mx-auto max-w-md rounded-3xl border border-work-line bg-work-bg p-3 shadow-lift">
      {/* window chrome */}
      <div className="flex items-center gap-1.5 px-2 pb-3 pt-1">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-[0.7rem] font-medium text-work-muted">NovaTech · Workspace</span>
      </div>
      <div className="rounded-2xl bg-work-panel p-4">
        <div className="flex items-center gap-3 border-b border-work-line pb-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
            MP
          </span>
          <div>
            <p className="text-sm font-semibold text-work-text">Maya Perera</p>
            <p className="flex items-center gap-1.5 text-[0.7rem] text-teal">
              <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse-dot" /> Head of Product
            </p>
          </div>
        </div>
        <div className="mt-3 space-y-3">
          <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-work-panel2 p-3 text-[0.8rem] leading-relaxed text-work-text">
            Retention dropped 18% last quarter and the room is already shouting
            ideas. Before we touch anything — what do you want to understand first?
          </div>
          <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-brand-500 p-3 text-[0.8rem] leading-relaxed text-white">
            Which users churned, and when exactly did the drop start? I'd split by
            new vs. returning before guessing.
          </div>
          <div className="flex items-center gap-1.5 pl-1 text-[0.72rem] text-work-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-work-muted animate-pulse-dot" />
            <span className="h-1.5 w-1.5 rounded-full bg-work-muted animate-pulse-dot [animation-delay:200ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-work-muted animate-pulse-dot [animation-delay:400ms]" />
            Maya is replying…
          </div>
        </div>
      </div>
    </div>
  );
}
