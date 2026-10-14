import Link from "next/link";
import type { Career } from "@/lib/types";
import { ArrowRight, Clock, Signal, Lock } from "./icons";

export function CareerCard({ career }: { career: Career }) {
  const className = `group flex flex-col rounded-2xl border border-line bg-surface p-5 transition ${
    career.available
      ? "hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift active:translate-y-px"
      : "opacity-85"
  }`;

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-ink-faint">{career.area}</p>
          <h2 className="mt-1 text-lg font-bold text-ink">{career.title}</h2>
        </div>
        {career.available ? (
          <span className="rounded-md bg-brand-50 px-2.5 py-1 text-[0.68rem] font-semibold text-brand-700">
            Available
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-md bg-black/[0.04] px-2.5 py-1 text-[0.68rem] font-semibold text-ink-faint">
            <Lock width={12} height={12} /> Soon
          </span>
        )}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink-muted">{career.blurb}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {career.skills.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className="rounded-md bg-brand-50 px-2 py-0.5 text-[0.7rem] font-medium text-brand-700"
          >
            {skill}
          </span>
        ))}
        {career.skills.length > 3 && (
          <span className="rounded-md px-2 py-0.5 text-[0.7rem] font-medium text-ink-faint">
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
        {career.available && (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
            Explore
            <ArrowRight
              width={16}
              height={16}
              className="transition group-hover:translate-x-0.5"
            />
          </span>
        )}
      </div>
    </>
  );

  return career.available ? (
    <Link href={`/careers/${career.slug}`} className={className}>
      {content}
    </Link>
  ) : (
    <article className={className}>{content}</article>
  );
}
