"use client";

// A Client Component only because it reads the current path to highlight the
// active link; the rest of the header stays on the server.

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Overview" },
  { href: "/patients", label: "Patients" },
  { href: "/appointments", label: "Appointments" },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="nav">
      {links.map(({ href, label }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
