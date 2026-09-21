"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signIn, type SignInState } from "@/lib/actions";
import { AlertIcon } from "@/components/ui";

// NEXT_PUBLIC_ variables are inlined into the browser bundle at build time,
// which is why this Client Component can read one. Anything secret must never
// carry that prefix.
const clinicName = process.env.NEXT_PUBLIC_CLINIC_NAME ?? "MedTrack Clinic";

export default function LoginForm({
  clinicians,
  from,
}: {
  clinicians: readonly string[];
  from?: string;
}) {
  const [state, formAction] = useActionState<SignInState, FormData>(signIn, {});

  return (
    <form action={formAction} className="book">
      <div>
        <h1>Sign in</h1>
        <p className="lede">to {clinicName}</p>
      </div>
      <input type="hidden" name="from" value={from ?? ""} />
      <label>
        Clinician
        <select name="clinician" defaultValue={clinicians[0]}>
          {clinicians.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {state.error && (
        <p className="error" role="alert">
          <AlertIcon size={16} /> {state.error}
        </p>
      )}
      <SubmitButton />
      <p className="meta hint">
        Demo password: <code>medtrack</code> (or whatever <code>DEMO_PASSWORD</code> is set to).
      </p>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}
