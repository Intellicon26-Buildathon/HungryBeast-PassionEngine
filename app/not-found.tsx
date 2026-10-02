import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="container-narrow py-24 text-center">
        <p className="display text-7xl font-semibold text-brand-500">404</p>
        <h1 className="display mt-4 text-3xl font-semibold">Page not found</h1>
        <p className="mt-3 text-ink-muted">
          That route doesn&apos;t exist. Let&apos;s get you back to exploring.
        </p>
        <Link href="/careers" className="btn btn-primary btn-lg mx-auto mt-6">
          Explore careers
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
