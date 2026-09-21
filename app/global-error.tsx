"use client"; // error boundaries must be Client Components

// The last line of defence. app/(clinic)/error.tsx catches errors in pages,
// but an error in the root layout itself can only be caught here — and because
// it replaces the root layout, it has to render its own <html> and <body>.

import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main className="shell" style={{ paddingTop: "4rem" }}>
          <div className="card empty danger">
            <h1>MedTrack hit a problem</h1>
            <p>
              Something went wrong loading the app.
              {error.digest && <> Reference: <code>{error.digest}</code></>}
            </p>
            <button onClick={reset}>Reload</button>
          </div>
        </main>
      </body>
    </html>
  );
}
