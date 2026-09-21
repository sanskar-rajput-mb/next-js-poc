import { Suspense } from "react";
import Link from "next/link";
import SearchField from "@/components/search-field";
import { Avatar, ChevronIcon, PatientListSkeleton, SearchIcon, TriageBadge } from "@/components/ui";
import { getPatients } from "@/lib/data";

export const metadata = { title: "Patients" };

// In Next.js 15 `searchParams` is a promise — the page is rendered before the
// request details are known, and awaiting it opts this route into dynamic
// rendering (rendered per request rather than at build time).
type Props = { searchParams: Promise<{ q?: string }> };

export default async function PatientsPage({ searchParams }: Props) {
  const { q } = await searchParams;

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Patient register</h1>
          <p className="lede">Everyone under the clinic’s care, with their current triage.</p>
        </div>
      </header>
      <div className="toolbar">
        <SearchField />
      </div>
      {/* Everything above renders immediately; the list streams in when the
          data resolves, using the fallback below in the meantime. */}
      <Suspense key={q} fallback={<PatientListSkeleton />}>
        <PatientList query={q} />
      </Suspense>
    </>
  );
}

async function PatientList({ query }: { query?: string }) {
  const patients = await getPatients(query);

  if (patients.length === 0) {
    return (
      <div className="card empty">
        <span className="icon"><SearchIcon size={22} /></span>
        <h2>No patient matches “{query}”</h2>
        <p>Check the spelling, or try searching by MRN instead.</p>
      </div>
    );
  }

  return (
    <>
      <div className="card flush">
        <div className="table-head patient-grid" aria-hidden="true">
          <span>Patient</span>
          <span>Current problem</span>
          <span>Clinician</span>
          <span>Triage</span>
          <span />
        </div>
        <ul className="rows">
          {patients.map((p) => (
            <li key={p.id}>
              <Link href={`/patients/${p.id}`} className="patient-row patient-grid">
                <div className="who">
                  <Avatar name={p.name} />
                  <div className="stack">
                    <strong className="truncate">{p.name}</strong>
                    <span className="meta">{p.mrn} · {p.age} yrs</span>
                  </div>
                </div>
                <span className="cond">{p.condition}</span>
                <span className="meta clin">{p.clinician}</span>
                <TriageBadge triage={p.triage} />
                <span className="chev"><ChevronIcon size={16} /></span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <p className="meta list-foot">
        {patients.length} {patients.length === 1 ? "patient" : "patients"}
        {query ? ` matching “${query}”` : ""}
      </p>
    </>
  );
}
