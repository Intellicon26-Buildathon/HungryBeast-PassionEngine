import Link from "next/link";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-canvas">
      <div className="container-px py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              Experience the work before you choose it. Built for Sri Lankan
              students exploring what comes after A/Ls.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterCol
              title="Product"
              links={[
                ["Explore careers", "/careers"],
                ["Dashboard", "/dashboard"],
                ["Learning resources", "/resources"],
              ]}
            />
            <FooterCol
              title="Account"
              links={[
                ["Sign in", "/signin"],
                ["Create account", "/signup"],
                ["Settings & privacy", "/settings"],
              ]}
            />
            <FooterCol
              title="About"
              links={[
                ["How it works", "/#how"],
                ["Our principles", "/#principles"],
              ]}
            />
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Passion Discovery Engine · IntelliCon&apos;26 prototype</p>
          <p>Practice &amp; reflection — not a diagnosis or a career guarantee.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-wider text-ink-faint">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="text-sm text-ink-muted transition hover:text-ink">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
