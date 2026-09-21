"use client";

// The form calls a Server Action directly. useActionState holds whatever the
// action returns (here, a validation error) and useFormStatus gives the
// pending state for free — no fetch, no loading flag, no API endpoint.

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { bookAppointment, type BookingState } from "@/lib/actions";
import { AlertIcon } from "@/components/ui";

export default function BookingForm({ onSubmit }: { onSubmit?: (form: FormData) => void }) {
  const [state, formAction] = useActionState<BookingState, FormData>(
    async (prev, form) => {
      // Runs inside the action's transition, which is what lets the parent's
      // optimistic update show while the server is still working.
      onSubmit?.(form);
      return bookAppointment(prev, form);
    },
    {},
  );

  return (
    <form action={formAction} className="book">
      <label>
        Patient
        <input name="patientName" placeholder="Full name" autoComplete="off" required />
      </label>
      <label>
        Date
        <input name="date" type="date" required />
      </label>
      <label>
        Reason for visit
        <input name="reason" placeholder="e.g. Medication review" required />
      </label>
      {state.error && (
        <p className="error" role="alert">
          <AlertIcon size={16} /> {state.error}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Booking…" : "Book appointment"}
    </button>
  );
}
