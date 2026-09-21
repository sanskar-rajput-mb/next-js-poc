// The (clinic) folder is a route group: the parentheses keep it out of the URL,
// so app/(clinic)/patients/page.tsx is still /patients. Its purpose is to give
// these pages a shared layout that the login screen doesn't get.

import Link from "next/link";
import NavLinks from "@/components/nav-links";
import { signOut } from "@/lib/actions";
import { LogOutIcon } from "@/components/ui";

// `modal` is a parallel route: whatever app/(clinic)/@modal renders for the
// current URL is passed in here alongside the page itself.
export default function ClinicLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      <header className="top">
        <div className="shell">
          <Link href="/" className="brand">
            <span className="brand-mark" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" />
              </svg>
            </span>
            <span>
              <strong>MedTrack</strong>
              <small>Clinic console</small>
            </span>
          </Link>
          {/* Active-link highlighting needs the current path, so the nav is
              a small Client Component inside this Server Component layout. */}
          <NavLinks />
          {/* A Server Action as a form action: signing out works even before
              any JavaScript has loaded. */}
          <form action={signOut} className="sign-out">
            <button type="submit" className="btn ghost" aria-label="Sign out">
              <LogOutIcon size={16} />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      </header>
      <main className="shell">{children}</main>
      {modal}
    </>
  );
}
