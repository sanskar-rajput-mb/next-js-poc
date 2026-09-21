// The (auth) route group gets its own layout: no app header or nav, just a
// split screen. Both groups still share the root layout above them.

import Image from "next/image";
// A static import gives next/image the width, height and a blur placeholder
// at build time, so the image reserves its space and fades in without jumping.
import hero from "@/public/images/clinic-hero.jpg";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth">
      <aside className="auth-art">
        {/* `fill` + `sizes` lets Next serve a resized, modern-format (WebP/AVIF)
            copy that matches the panel's width, instead of the 1200px original. */}
        <Image
          src={hero}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="(max-width: 900px) 0px, 45vw"
          style={{ objectFit: "cover" }}
        />
        <div className="auth-art-copy">
          <span className="brand-mark lg" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" />
            </svg>
          </span>
          <p className="auth-quote">Triage, records and appointments — one calm view of the clinic day.</p>
          <p className="auth-foot">MedTrack · proof of concept</p>
        </div>
      </aside>
      <main className="auth-main">{children}</main>
    </div>
  );
}
