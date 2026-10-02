import Link from "next/link";
import type { Career } from "@/lib/types";
import { ArrowRight, Clock, Signal, Lock } from "./icons";

const ACCENT: Record<Career["accent"], { bar: string; chip: string; dot: string }> = {
  brand: { bar: "bg-brand-500", chip: "bg-brand-50 text-brand-700", dot: "bg-brand-500" },
  teal: { bar: "bg-teal", chip: "bg-teal-soft text-teal", dot: "bg-teal" },
  accent: { bar: "bg-accent", chip: "bg-accent-soft text-accent", dot: "bg-accent" },
  amber: { bar: "bg-amber", chip: "bg-amber-soft text-amber", dot: "bg-amber" },
};

export function CareerCard({ career }: { career: Career }) {
  const a = ACCENT[career.accent];
  const Wrapper: any = career.available ? Link : "div";
  const wrapperProps = career.available
    ? { href: `/careers/${career.slug}` }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface p-5 shadow-card transition ${
        career.available
          ? "hover:-translate-y-1 hover:shadow-lift cursor-pointer"
          : "opacity-85"
      }`}
    >
      <span className={`absolute inset-x-0 top-0 h-1 ${a.bar}`} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
            {career.area}
          </p>
          <h3 className="mt-1 text-lg font-bold text-ink">{career.title}</h3>
        </div>
        {career.available ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-soft px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wide text-teal">
            <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse-dot" /> Live
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.04] px-2.5 py-1 text-[0.68rem] font-semibold text-ink-faint">
            <Lock width={12} height={12} /> Soon
          </span>
        )}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink-muted">{career.blurb}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {career.skills.slice(0, 3).map((s) => (
          <span key={s} className={`rounded-md px-2 py-0.5 text-[0.7rem] font-semibold ${a.chip}`}>
            {s}
          </span>
        ))}
        {career.skills.length > 3 && (
          <span className="rounded-md px-2 py-0.5 text-[0.7rem] font-semibold text-ink-faint">
            +{career.skills.length - 3}
          </span>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
        <div className="flex items-center gap-4 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <Clock width={14} height={14} /> {career.durationMin} min
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Signal width={14} height={14} /> {career.difficulty}
          </span>
        </div>
        {career.available ? (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
            Experience it
            <ArrowRight width={16} height={16} className="transition group-hover:translate-x-0.5" />
          </span>
        ) : (
          <span className="text-xs font-medium text-ink-faint">In development</span>
        )}
      </div>
    </Wrapper>
  );
}
