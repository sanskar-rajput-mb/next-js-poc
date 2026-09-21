// A Route Handler: app/api/patients/route.ts becomes GET /api/patients.
// This is how you expose a plain JSON endpoint for a mobile app or a third
// party — pages themselves don't need it, they read the data layer directly.

import { NextResponse } from "next/server";
import { getPatients } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const patients = await getPatients(searchParams.get("q") ?? undefined);

  return NextResponse.json(
    { count: patients.length, patients },
    { headers: { "Cache-Control": "no-store" } },
  );
}
