import Link from "next/link";

export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect width="32" height="32" rx="9" fill="#5A3FF0" />
      <path
        d="M16 7.5 19.2 14l6.3 2.9-6.3 2.9L16 26.5 12.8 19.8 6.5 16.9l6.3-2.9L16 7.5Z"
        fill="#fff"
        opacity="0.96"
      />
      <circle cx="16" cy="16.9" r="2.1" fill="#5A3FF0" />
    </svg>
  );
}

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 group">
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span
          className={`text-[0.95rem] font-extrabold tracking-tight ${
            dark ? "text-white" : "text-ink"
          }`}
        >
          Passion Discovery
        </span>
        <span
          className={`text-[0.62rem] font-semibold uppercase tracking-[0.22em] ${
            dark ? "text-work-muted" : "text-ink-faint"
          }`}
        >
          Engine
        </span>
      </span>
    </Link>
  );
}
