// Small presentational pieces shared across pages. No hooks or event handlers,
// so these stay Server Components and ship no JavaScript.

import type { Triage } from "@/lib/data";
import { formatDay, initials } from "@/lib/format";

const triageLabel: Record<Triage, string> = {
  urgent: "Urgent",
  review: "Review",
  routine: "Routine",
};

export function TriageBadge({ triage }: { triage: Triage }) {
  return <span className={`triage ${triage}`}>{triageLabel[triage]}</span>;
}

export function Avatar({ name, large }: { name: string; large?: boolean }) {
  return (
    <span className={large ? "avatar lg" : "avatar"} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

export function DateBlock({ iso }: { iso: string }) {
  return (
    <time className="date-block" dateTime={iso}>
      <span>{formatDay(iso, { month: "short" })}</span>
      <strong>{formatDay(iso, { day: "numeric" })}</strong>
    </time>
  );
}

export function PatientListSkeleton() {
  return (
    <div className="card flush" aria-busy="true" aria-label="Loading patients">
      <ul className="rows">
        {[0, 1, 2, 3].map((i) => (
          <li key={i} className="skeleton-row">
            <span className="skeleton circle" />
            <span className="skeleton line" style={{ width: "28%" }} />
            <span className="skeleton line" style={{ width: "36%" }} />
          </li>
        ))}
      </ul>
    </div>
  );
}

// Icons are inline SVG so they inherit `currentColor` and need no icon library.
type IconProps = { size?: number };

function Svg({ size = 18, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>
);
export const ChevronIcon = (p: IconProps) => (
  <Svg {...p}><path d="m9 6 6 6-6 6" /></Svg>
);
export const ArrowLeftIcon = (p: IconProps) => (
  <Svg {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></Svg>
);
export const CheckIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></Svg>
);
export const CalendarIcon = (p: IconProps) => (
  <Svg {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></Svg>
);
export const AlertIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5v.01" /></Svg>
);
export const LogOutIcon = (p: IconProps) => (
  <Svg {...p}><path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M16 17l5-5-5-5M21 12H9" /></Svg>
);
export const CloseIcon = (p: IconProps) => (
  <Svg {...p}><path d="M6 6l12 12M18 6 6 18" /></Svg>
);
