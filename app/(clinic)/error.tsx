"use client"; // error boundaries must be Client Components

import { AlertIcon } from "@/components/ui";

// Catches a thrown error anywhere below it and offers a way back, instead of
// blanking the whole app.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="card empty danger">
      <span className="icon"><AlertIcon size={22} /></span>
      <h1>That didn’t load</h1>
      <p>{error.message || "The clinic record service didn’t respond."}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
