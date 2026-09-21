// A dynamic route: the folder name [id] becomes a parameter.
// /patients/p-1001 renders this file with params.id === "p-1001".

import { notFound } from "next/navigation";
import Link from "next/link";
import { getAppointments, getPatient, getPatients } from "@/lib/data";
import { formatDay } from "@/lib/format";
import { ArrowLeftIcon, Avatar, CalendarIcon, DateBlock, TriageBadge } from "@/components/ui";

type Props = { params: Promise<{ id: string }> };

// Incremental Static Regeneration. generateStaticParams lists the records to
// prerender at build time (the build output marks this route ●). `revalidate`
// refreshes a page in the background at most once a minute, and a booking's
// revalidateTag("appointments") refreshes it straight away. Patients added
// after the build are rendered on first visit and then cached the same way.
export const revalidate = 60;

export async function generateStaticParams() {
  const patients = await getPatients();
  return patients.map((p) => ({ id: p.id }));
}

// Per-page metadata built from the data — the browser tab and any link preview
// show the patient's name instead of a generic title. getPatient is wrapped in
// React's cache(), so this and the page below share one lookup.
export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const patient = await getPatient(id);
  return { title: patient ? patient.name : "Patient not found" };
}

export default async function PatientPage({ params }: Props) {
  const { id } = await params;
  const [patient, appointments] = await Promise.all([getPatient(id), getAppointments()]);

  // notFound() stops rendering here and shows the nearest not-found.tsx.
  if (!patient) notFound();

  const booked = appointments.filter((a) => a.patientName === patient.name);

  return (
    <>
      <Link href="/patients" className="back">
        <ArrowLeftIcon size={15} /> Patient register
      </Link>

      <section className="card profile">
        <div className="profile-top">
          <Avatar name={patient.name} large />
          <div className="grow">
            <div className="title-row">
              <h1>{patient.name}</h1>
              <TriageBadge triage={patient.triage} />
            </div>
            <p className="meta" style={{ margin: 0 }}>
              {patient.mrn} · {patient.age} years old
            </p>
          </div>
          <Link href="/appointments" className="btn secondary">
            <CalendarIcon size={16} /> Book appointment
          </Link>
        </div>
        <dl className="facts">
          <div><dt>MRN</dt><dd>{patient.mrn}</dd></div>
          <div><dt>Age</dt><dd>{patient.age}</dd></div>
          <div><dt>Clinician</dt><dd>{patient.clinician}</dd></div>
          <div>
            <dt>Last seen</dt>
            <dd>{formatDay(patient.lastSeen, { day: "numeric", month: "short", year: "numeric" })}</dd>
          </div>
        </dl>
      </section>

      <div className="grid-2">
        <section className="card">
          <div className="card-head"><h2>Current problem</h2></div>
          <p className="problem">{patient.condition}</p>
        </section>

        <section className="card">
          <div className="card-head"><h2>Appointments</h2></div>
          {booked.length === 0 ? (
            <div className="empty compact">
              <p>Nothing booked for {patient.name}.</p>
            </div>
          ) : (
            <ul className="rows">
              {booked.map((a) => (
                <li key={a.id} className="item">
                  <DateBlock iso={a.date} />
                  <div className="stack grow">
                    <strong>{a.reason}</strong>
                    <span className="meta">
                      {formatDay(a.date, { weekday: "long", day: "numeric", month: "long" })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
