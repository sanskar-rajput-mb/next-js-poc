import "server-only";

import { cookies } from "next/headers";
import { clinicians } from "./data";
import { SESSION_COOKIE } from "./session";

export type Clinician = (typeof clinicians)[number];

// Reading cookies() makes whatever calls this render per request, so only call
// it where the page genuinely needs to know who is looking at it.
export async function getClinician(): Promise<Clinician | null> {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  return clinicians.find((c) => c === value) ?? null;
}
