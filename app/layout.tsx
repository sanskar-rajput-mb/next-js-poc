// app/layout.tsx — the root layout. It wraps every page, renders <html>/<body>,
// and does NOT re-render when you navigate between pages. The app chrome lives
// one level down, in the route-group layouts (clinic) and (auth).

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// next/font downloads the font at build time and serves it from this app, so
// there's no request to Google from the browser and no layout shift on load.
const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

// Static metadata. `template` gives every child page the "… · MedTrack" suffix.
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "MedTrack Clinic", template: "%s · MedTrack" },
  description: "A small clinic console: patient list, triage and appointments.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
