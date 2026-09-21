// A Server Component. It runs only on the server, so it can read data directly
// and ships zero JavaScript for itself to the browser.

import Link from "next/link";
import { getPatients, getAppointments, type Triage } from "@/lib/data";
import { formatDay, relativeDay, todayIso } from "@/lib/format";
import { Avatar, CalendarIcon, DateBlock, TriageBadge } from "@/components/ui";
import { getClinician } from "@/lib/auth";

// No `export const dynamic` needed: reading the session cookie in getClinician()
// is enough to make Next render this page per request.

const triageOrder: Record<Triage, number> = { urgent: 0, review: 1, routine: 2 };

export default async function OverviewPage() {
  const [patients, appointments, clinician] = await Promise.all([
    getPatients(),
    getAppointments(),
    getClinician(),
  ]);
  const today = todayIso();
  const count = (t: Triage) => patients.filter((p) => p.triage === t).length;
  const upcoming = appointments.filter((a) => a.date >= today);
  const mine = patients.filter((p) => p.clinician === clinician).length;
  const attention = patients
    .filter((p) => p.triage !== "routine")
    .sort((a, b) => triageOrder[a.triage] - triageOrder[b.triage]);

  return (
    <>
      <header className="page-head">
        <div>
          <p className="eyebrow">{formatDay(today, { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1>{clinician ? `Welcome back, ${clinician}` : "Today at the clinic"}</h1>
          <p className="lede">
            {clinician
              ? `${mine} of the ${patients.length} patients on the register are under your care.`
              : "A snapshot of the register and the appointment book."}
          </p>
        </div>
        <Link href="/appointments" className="btn">
          <CalendarIcon size={16} /> Book appointment
        </Link>
      </header>

      <section className="stats" aria-label="Clinic summary">
        <Stat label="On the register" value={patients.length} hint="active patients" />
        <Stat label="Urgent" value={count("urgent")} hint="need attention today" tone="urgent" />
        <Stat label="Due for review" value={count("review")} hint="follow-up pending" tone="review" />
        <Stat label="Upcoming" value={upcoming.length} hint={`of ${appointments.length} appointments`} tone="accent" />
      </section>

      <div className="grid-2">
        <section className="card">
          <div className="card-head">
            <h2>Next up</h2>
            <Link href="/appointments" className="card-link">All appointments →</Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="empty compact">
              <p>No upcoming appointments.</p>
            </div>
          ) : (
            <ul className="rows">
              {upcoming.slice(0, 4).map((a) => {
                const rel = relativeDay(a.date, today);
                return (
                  <li key={a.id} className="item">
                    <DateBlock iso={a.date} />
                    <div className="stack grow">
                      <strong className="truncate">{a.patientName}</strong>
                      <span className="meta truncate">{a.reason}</span>
                    </div>
                    {rel && <span className="chip">{rel}</span>}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Needs attention</h2>
            <Link href="/patients" className="card-link">Patient register →</Link>
          </div>
          {attention.length === 0 ? (
            <div className="empty compact">
              <p>Nobody is flagged for urgent care or review.</p>
            </div>
          ) : (
            <ul className="rows">
              {attention.map((p) => (
                <li key={p.id}>
                  <Link href={`/patients/${p.id}`} className="item">
                    <Avatar name={p.name} />
                    <div className="stack grow">
                      <strong className="truncate">{p.name}</strong>
                      <span className="meta truncate">{p.condition}</span>
                    </div>
                    <TriageBadge triage={p.triage} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: number;
  hint: string;
  tone?: "urgent" | "review" | "accent";
}) {
  return (
    <div className={`card stat ${tone ?? ""}`}>
      <div className="stat-label">
        <span className="dot" /> {label}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-hint">{hint}</div>
    </div>
  );
}
