// Display helpers. Dates in the data layer are plain "YYYY-MM-DD" strings, so
// they're parsed and formatted in UTC to stop the server's timezone shifting
// them by a day.

const parse = (iso: string) => new Date(`${iso}T00:00:00Z`);

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDay(iso: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...options }).format(parse(iso));
}

// "Today" / "Tomorrow" / "Yesterday", or null for anything further out.
export function relativeDay(iso: string, today = todayIso()) {
  const days = Math.round((parse(iso).getTime() - parse(today).getTime()) / 86_400_000);
  return ({ [-1]: "Yesterday", 0: "Today", 1: "Tomorrow" } as Record<number, string>)[days] ?? null;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}
