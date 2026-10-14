import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CareerCard } from "@/components/CareerCard";
import { CAREERS } from "@/lib/scenarios";
import { Sparkle } from "@/components/icons";

export default function CareersPage() {
  const careers = CAREERS.filter((career) => career.available);

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
            Explore a playable simulation based on real product work. More
            careers will appear here when their simulations are ready.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {careers.map((c) => (
            <CareerCard key={c.slug} career={c} />
          ))}
        </div>

      </main>
      <SiteFooter />
    </>
  );
}
