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
            Choose a role. Try the work.
          </h1>
          <p className="mt-3 text-ink-muted">
            Choose from {careers.length} playable career simulations. Each uses
            a fictional workplace case and role-specific tasks, with feedback
            based on the answers you give.
          </p>
        </div>

        {careers.length ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {careers.map((career) => (
              <CareerCard key={career.slug} career={career} />
            ))}
          </div>
        ) : (
          <p className="mt-8 rounded-2xl border border-line bg-surface p-6 text-sm text-ink-muted">
            No career simulations are available right now. Please check back soon.
          </p>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
