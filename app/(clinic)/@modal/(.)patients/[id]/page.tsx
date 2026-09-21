// An intercepting route. "(.)patients" means "intercept /patients/… from this
// level". When you click a patient link inside the app, this renders in the
// @modal slot on top of the current page, and the URL still changes to
// /patients/p-1001. Reload, or open the link in a new tab, and you get the full
// page at app/(clinic)/patients/[id] instead.

import { notFound } from "next/navigation";
import Modal from "@/components/modal";
import { Avatar, TriageBadge } from "@/components/ui";
import { getPatient } from "@/lib/data";
import { formatDay } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

export default async function PatientModal({ params }: Props) {
  const { id } = await params;
  const patient = await getPatient(id);
  if (!patient) notFound();

  return (
    <Modal label={`${patient.name}, quick view`}>
      <div className="profile-top">
        <Avatar name={patient.name} large />
        <div className="grow">
          <div className="title-row">
            <h2 className="modal-title">{patient.name}</h2>
            <TriageBadge triage={patient.triage} />
          </div>
          <p className="meta" style={{ margin: 0 }}>
            {patient.mrn} · {patient.age} years old
          </p>
        </div>
      </div>

      <dl className="facts modal-facts">
        <div><dt>Clinician</dt><dd>{patient.clinician}</dd></div>
        <div>
          <dt>Last seen</dt>
          <dd>{formatDay(patient.lastSeen, { day: "numeric", month: "short", year: "numeric" })}</dd>
        </div>
      </dl>

      <h3 className="modal-sub">Current problem</h3>
      <p className="problem">{patient.condition}</p>

      <div className="modal-actions">
        {/* A plain <a>, not <Link>: a full page load skips the interception and
            shows the complete record. */}
        <a href={`/patients/${patient.id}`} className="btn">Open full record</a>
      </div>
    </Modal>
  );
}
