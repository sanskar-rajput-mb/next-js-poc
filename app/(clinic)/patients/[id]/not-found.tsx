// Rendered whenever notFound() is called inside this route segment.
import Link from "next/link";
import { SearchIcon } from "@/components/ui";

export default function PatientNotFound() {
  return (
    <div className="card empty">
      <span className="icon"><SearchIcon size={22} /></span>
      <h1>No such patient</h1>
      <p>That record number isn’t on this clinic’s register.</p>
      <Link href="/patients" className="btn">Back to the register</Link>
    </div>
  );
}
