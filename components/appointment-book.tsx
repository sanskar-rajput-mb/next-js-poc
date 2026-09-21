"use client";

// The schedule and the booking form share state here so the list can update
// optimistically: useOptimistic shows the new booking the moment the form is
// submitted, then swaps in the server's real list once the action finishes —
// or quietly drops it again if the server rejects the booking.

import { useOptimistic } from "react";
import BookingForm from "@/components/booking-form";
import { DateBlock } from "@/components/ui";
import type { Appointment } from "@/lib/data";
import { formatDay, relativeDay } from "@/lib/format";

type Row = Appointment & { pending?: boolean };

export default function AppointmentBook({
  appointments,
  today,
}: {
  appointments: Appointment[];
  today: string;
}) {
  const [rows, addOptimistic] = useOptimistic<Row[], Row>(appointments, (current, added) =>
    [...current, added].sort((a, b) => a.date.localeCompare(b.date)),
  );

  function showPending(form: FormData) {
    const patientName = String(form.get("patientName") ?? "").trim();
    const date = String(form.get("date") ?? "");
    const reason = String(form.get("reason") ?? "").trim();
    if (patientName && date && reason) {
      addOptimistic({ id: `pending-${Date.now()}`, patientName, date, reason, pending: true });
    }
  }

  return (
    <div className="split">
      <section className="card flush">
        <div className="card-head"><h2>Schedule</h2></div>
        {rows.length === 0 ? (
          <div className="empty compact">
            <p>The book is empty. Use the form to add the first appointment.</p>
          </div>
        ) : (
          <ul className="rows">
            {rows.map((a) => {
              const rel = relativeDay(a.date, today);
              const past = a.date < today;
              return (
                <li key={a.id} className={`item${past ? " past" : ""}${a.pending ? " pending" : ""}`}>
                  <DateBlock iso={a.date} />
                  <div className="stack grow">
                    <strong className="truncate">{a.patientName}</strong>
                    <span className="meta truncate">
                      {formatDay(a.date, { weekday: "long" })} · {a.reason}
                    </span>
                  </div>
                  {a.pending ? (
                    <span className="chip muted">Saving…</span>
                  ) : rel ? (
                    <span className={past ? "chip muted" : "chip"}>{rel}</span>
                  ) : (
                    past && <span className="chip muted">Past</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <aside className="card sticky">
        <div className="card-head"><h2>Book a slot</h2></div>
        <p className="meta">Add a patient to the appointment book.</p>
        <BookingForm onSubmit={showPending} />
      </aside>
    </div>
  );
}
