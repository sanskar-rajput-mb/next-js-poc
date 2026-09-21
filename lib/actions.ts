"use server";

// Server Actions: functions that run on the server but are called straight from
// a form in the browser. No fetch call, no /api route, no client-side state.

import { revalidateTag } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { addAppointment, clinicians } from "./data";
import { SESSION_COOKIE, safeRedirect } from "./session";

export type BookingState = { error?: string };
export type SignInState = { error?: string };

// after() runs once the response has been sent, so slow side work such as audit
// logging never holds up the person waiting on the page.
function audit(event: string) {
  after(() => console.info(`[audit] ${new Date().toISOString()} ${event}`));
}

export async function bookAppointment(
  _prev: BookingState,
  formData: FormData,
): Promise<BookingState> {
  const patientName = String(formData.get("patientName") ?? "").trim();
  const date = String(formData.get("date") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  // Validation belongs on the server — the client can always be bypassed.
  if (!patientName || !date || !reason) {
    return { error: "Patient, date and reason are all required." };
  }
  if (new Date(date) < new Date(new Date().toDateString())) {
    return { error: "Pick a date that hasn't already passed." };
  }

  await addAppointment({ patientName, date, reason });
  const clinician = (await cookies()).get(SESSION_COOKIE)?.value ?? "unknown";
  audit(`${clinician} booked ${patientName} on ${date}`);

  // Throw away every cached result and page tagged "appointments" — the
  // overview, this page and each patient record — so the booking shows up.
  revalidateTag("appointments");
  redirect("/appointments?booked=1");
}

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const clinician = String(formData.get("clinician") ?? "");
  const password = String(formData.get("password") ?? "");

  // DEMO_PASSWORD has no NEXT_PUBLIC_ prefix, so it only exists on the server.
  const expected = process.env.DEMO_PASSWORD ?? "medtrack";

  if (!clinicians.some((c) => c === clinician) || password !== expected) {
    return { error: "That clinician and password don’t match." };
  }

  (await cookies()).set(SESSION_COOKIE, clinician, {
    httpOnly: true, // not readable from browser JavaScript
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // one clinic shift
    // Add `secure: true` once the app is served over HTTPS.
  });

  const agent = (await headers()).get("user-agent") ?? "unknown browser";
  audit(`${clinician} signed in (${agent.slice(0, 60)})`);

  redirect(safeRedirect(String(formData.get("from") ?? "")));
}

export async function signOut() {
  const store = await cookies();
  audit(`${store.get(SESSION_COOKIE)?.value ?? "unknown"} signed out`);
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
