import Link from "next/link";
import { ArrowRight } from "./icons";

/** Shown on auth screens when the server has no Supabase config. */
export function PrototypeNotice() {
  return (
    <div className="rounded-2xl border border-sky-100 bg-sky-50 p-5 text-sm leading-relaxed text-ink-muted">
      <p className="font-semibold text-ink">Accounts aren&apos;t enabled on this server</p>
      <p className="mt-2">
        Supabase isn&apos;t configured, so this build runs in prototype mode: your
        simulations are saved in this browser only. You can still try everything.
      </p>
      <Link href="/careers" className="btn btn-primary btn-md mt-4">
        Explore careers <ArrowRight width={16} height={16} />
      </Link>
    </div>
  );
}
