import Link from "next/link";
import { SearchIcon } from "@/components/ui";

// Unmatched URLs render inside the root layout only, outside the (clinic)
// group, so this page brings its own spacing instead of the app header.
export default function NotFound() {
  return (
    <main className="shell" style={{ paddingTop: "4rem" }}>
      <div className="card empty">
        <span className="icon"><SearchIcon size={22} /></span>
        <h1>Page not found</h1>
        <p>Nothing lives at that address.</p>
        <Link href="/" className="btn">Back to the overview</Link>
      </div>
    </main>
  );
}
