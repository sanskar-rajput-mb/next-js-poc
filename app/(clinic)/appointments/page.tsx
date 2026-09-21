import AppointmentBook from "@/components/appointment-book";
import { CheckIcon } from "@/components/ui";
import { getAppointments } from "@/lib/data";
import { todayIso } from "@/lib/format";

export const metadata = { title: "Appointments" };

// Awaiting searchParams already makes this page render per request, and the
// data it reads is tagged "appointments", so a booking's revalidateTag call is
// all it takes for the new row to appear.
type Props = { searchParams: Promise<{ booked?: string }> };

export default async function AppointmentsPage({ searchParams }: Props) {
  const [{ booked }, appointments] = await Promise.all([
    searchParams,
    getAppointments(),
  ]);

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Appointments</h1>
          <p className="lede">
            {appointments.length} {appointments.length === 1 ? "appointment" : "appointments"} in the book, soonest first.
          </p>
        </div>
      </header>

      {booked && (
        <p className="notice" role="status">
          <CheckIcon /> Appointment booked.
        </p>
      )}

      {/* The server fetches; the client component adds optimistic rows on top. */}
      <AppointmentBook appointments={appointments} today={todayIso()} />
    </>
  );
}
