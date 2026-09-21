// A fake data layer. In a real app these functions would hit a database or an
// EHR API; here they just return in-memory records after a short delay so the
// loading / streaming states are actually visible.

// Importing this module from a Client Component is now a build error, so patient
// records (and later, database credentials) can never leak into the browser bundle.
import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";

export type Triage = "routine" | "review" | "urgent";

export type Patient = {
  id: string;
  mrn: string;
  name: string;
  age: number;
  triage: Triage;
  condition: string;
  clinician: string;
  lastSeen: string;
};

export type Appointment = {
  id: string;
  patientName: string;
  date: string;
  reason: string;
};

export const clinicians = ["Dr. Rao", "Dr. Menon", "Dr. Baptiste"] as const;

const seedPatients: Patient[] = [
  { id: "p-1001", mrn: "MRN-1001", name: "Razor Callahan", age: 64, triage: "urgent",  condition: "Type 2 diabetes, poor glycaemic control", clinician: "Dr. Rao",    lastSeen: "2026-09-14" },
  { id: "p-1002", mrn: "MRN-1002", name: "Bull", age: 41, triage: "review",  condition: "Hypertension, medication review due",   clinician: "Dr. Menon",  lastSeen: "2026-08-30" },
  { id: "p-1003", mrn: "MRN-1003", name: "Ronald McCrea", age: 29, triage: "routine", condition: "Antenatal care, 22 weeks",              clinician: "Dr. Rao",    lastSeen: "2026-09-02" },
  { id: "p-1004", mrn: "MRN-1004", name: "Izzy",  age: 73, triage: "urgent",  condition: "Post-op wound check, day 6",            clinician: "Dr. Baptiste", lastSeen: "2026-09-17" },
  { id: "p-1005", mrn: "MRN-1005", name: "Baron",  age: 55, triage: "routine", condition: "Asthma, stable on inhaled steroid",     clinician: "Dr. Menon",  lastSeen: "2026-07-21" },
];
const seedAppointments: Appointment[] = [
  { id: "a-1", patientName: "Razor Callahan",   date: "2026-09-21", reason: "Wound review" },
  { id: "a-2", patientName: "Bull",   date: "2026-09-22", reason: "HbA1c results" },
];
const store = ((globalThis as typeof globalThis & {
  __medtrack?: { patients: Patient[]; appointments: Appointment[]; bootId: string };
}).__medtrack ??= {
  patients: seedPatients,
  appointments: seedAppointments,
  bootId: Date.now().toString(36),
});

const patients = store.patients;
const appointments = store.appointments;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Caching
//
// unstable_cache stores a function's result in Next's Data Cache, which is
// shared across requests (and survives restarts, on disk under .next/cache).
// Each entry carries tags; revalidateTag("appointments") in a Server Action
// throws away every entry — and every cached page — that used that tag.
//
// The in-memory "database" resets on restart but the Data Cache doesn't, so the
// process's bootId goes into the cache key to stop stale results outliving it.
// ---------------------------------------------------------------------------

const getAllPatients = unstable_cache(
  async () => {
    await delay(600);
    return patients;
  },
  ["patients", store.bootId],
  { tags: ["patients"], revalidate: 3600 },
);

export async function getPatients(query?: string): Promise<Patient[]> {
  if (query) await delay(400); // searching still "hits the database"
  const all = await getAllPatients();
  if (!query) return all;
  const q = query.toLowerCase();
  return all.filter(
    (p) => p.name.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q),
  );
}

// React's cache() de-duplicates calls within a single render: generateMetadata
// and the page both ask for the same patient, but the lookup runs once.
export const getPatient = cache(async (id: string): Promise<Patient | undefined> => {
  await delay(400);
  return patients.find((p) => p.id === id);
});

export const getAppointments = unstable_cache(
  async (): Promise<Appointment[]> => {
    await delay(300);
    return [...appointments].sort((a, b) => a.date.localeCompare(b.date));
  },
  ["appointments", store.bootId],
  { tags: ["appointments"] },
);

export async function addAppointment(input: Omit<Appointment, "id">) {
  await delay(500);
  appointments.push({ id: `a-${appointments.length + 1}`, ...input });
}
