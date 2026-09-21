import { PatientListSkeleton } from "@/components/ui";

// loading.tsx wraps the route in a Suspense boundary automatically, so this
// shows the instant a navigation starts — before the data is ready.
export default function Loading() {
  return (
    <>
      <header className="page-head">
        <div>
          <span className="skeleton title" />
          <span className="skeleton line" style={{ width: "20rem", maxWidth: "80vw" }} />
        </div>
      </header>
      <PatientListSkeleton />
    </>
  );
}
