import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...p,
});

export const ArrowRight = (p: P) => (
  <svg {...base(p)}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
);
export const Sparkle = (p: P) => (
  <svg {...base(p)}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" /></svg>
);
export const Compass = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="m15 9-2 6-4 2 2-6 4-2Z" /></svg>
);
export const Briefcase = (p: P) => (
  <svg {...base(p)}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" /></svg>
);
export const Chart = (p: P) => (
  <svg {...base(p)}><path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-7" /></svg>
);
export const Check = (p: P) => (
  <svg {...base(p)}><path d="m5 12 4.5 4.5L19 7" /></svg>
);
export const CheckCircle = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" /></svg>
);
export const Play = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none"><path d="M7 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 7 5.5Z" /></svg>
);
export const Lock = (p: P) => (
  <svg {...base(p)}><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
);
export const Users = (p: P) => (
  <svg {...base(p)}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5.2a3.2 3.2 0 0 1 0 6M18 20a5.5 5.5 0 0 0-3-5" /></svg>
);
export const Target = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" fill="currentColor" /></svg>
);
export const Message = (p: P) => (
  <svg {...base(p)}><path d="M20 15a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z" /></svg>
);
export const Shield = (p: P) => (
  <svg {...base(p)}><path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6Z" /><path d="m9 12 2 2 4-4" /></svg>
);
export const Clock = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const Signal = (p: P) => (
  <svg {...base(p)}><path d="M5 18v-3M10 18v-6M15 18v-9M20 18V6" /></svg>
);
export const Send = (p: P) => (
  <svg {...base(p)}><path d="M4 12 20 4l-6 16-3-7-7-1Z" /></svg>
);
export const Refresh = (p: P) => (
  <svg {...base(p)}><path d="M4 11a8 8 0 0 1 13.6-5.6L20 7M20 4v3h-3M20 13a8 8 0 0 1-13.6 5.6L4 17M4 20v-3h3" /></svg>
);
export const Menu = (p: P) => (
  <svg {...base(p)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const Close = (p: P) => (
  <svg {...base(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const Spark = Sparkle;
export const Dot = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none"><circle cx="12" cy="12" r="4" /></svg>
);
export const Bulb = (p: P) => (
  <svg {...base(p)}><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.5.4.9 1 .9 1.6V16h5.2v-.5c0-.6.4-1.2.9-1.6A6 6 0 0 0 12 3Z" /></svg>
);
export const Layers = (p: P) => (
  <svg {...base(p)}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5M3 18l9 5 9-5" opacity="0.5" /></svg>
);
export const Globe = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></svg>
);
