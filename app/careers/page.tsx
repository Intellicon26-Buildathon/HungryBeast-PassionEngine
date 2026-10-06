"use client";

import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CareerCard } from "@/components/CareerCard";
import { CAREERS } from "@/lib/scenarios";
import { Sparkle } from "@/components/icons";

const FILTERS = ["All areas", "Technology", "Design", "Business"];

export default function CareersPage() {
  const [filter, setFilter] = useState("All areas");
  const [onlyLive, setOnlyLive] = useState(false);

  const careers = useMemo(() => {
    return CAREERS.filter((c) => {
      const inArea = filter === "All areas" || c.area.toLowerCase().includes(filter.toLowerCase());
      const live = !onlyLive || c.available;
      return inArea && live;
    });
  }, [filter, onlyLive]);

  return (
    <>
      <SiteHeader />
      <main className="container-px py-12">
        <div className="max-w-2xl">
          <span className="eyebrow"><Sparkle width={15} height={15} /> Career catalogue</span>
          <h1 className="display mt-4 text-4xl font-semibold sm:text-5xl">
            Pick a job. Go and do it.
          </h1>
          <p className="mt-3 text-ink-muted">
            Each card is a short, realistic work simulation. Start with the live
            one — the rest are on the way.
          </p>
        </div>

        {/* Filters */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 ${
                  filter === f
                    ? "bg-ink text-white"
                    : "border border-line bg-surface text-ink-muted hover:border-sky-300 hover:bg-sky-50 hover:shadow-[0_0_0_3px_rgba(125,211,252,0.28),0_0_18px_rgba(125,211,252,0.24)]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink-muted">
            <input
              type="checkbox"
              checked={onlyLive}
              onChange={(e) => setOnlyLive(e.target.checked)}
              className="h-4 w-4 rounded border-line text-brand-500 focus:ring-brand-500"
            />
            Live simulations only
          </label>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {careers.map((c) => (
            <CareerCard key={c.slug} career={c} />
          ))}
        </div>

        {careers.length === 0 && (
          <div className="mt-16 rounded-2xl border border-dashed border-line bg-surface p-12 text-center">
            <p className="text-ink-muted">No simulations match that filter yet.</p>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
