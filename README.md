# MedTrack — a small Next.js clinic console

A deliberately small proof of concept (App Router, Next.js 15, React 19,
TypeScript). A sign-in screen, a clinic overview, a searchable patient register
with a quick-view modal and a full record page, and an appointments page you
can book into.

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
```

Sign in as any clinician with the password `medtrack`. Copy `.env.example` to
`.env.local` to change it (and the other settings); every value has a default.

There is no database. `lib/data.ts` holds the records in memory and adds a
small delay so the loading and streaming states are actually visible.

What we learned building it, measured results and the gaps before production
are written up in [docs/LEARNINGS.md](docs/LEARNINGS.md).

> Don't run `npm run build` while `npm run dev` is running — both write to
> `.next/` and the dev server will start throwing "Cannot find module" errors.
> Stop it, `rm -rf .next`, and start it again if that happens.

## What each concept lives in

**Routing and layouts**

| Concept | File |
| --- | --- |
| Root layout, metadata template, `metadataBase` | `app/layout.tsx` |
| Route groups with their own layouts | `app/(clinic)/layout.tsx`, `app/(auth)/layout.tsx` |
| Template (re-mounts on every navigation) | `app/(clinic)/template.tsx` |
| Dynamic route `[id]`, `generateMetadata`, `notFound()` | `app/(clinic)/patients/[id]/page.tsx` |
| Parallel route (`@modal` slot), `default.tsx`, catch-all | `app/(clinic)/@modal/` |
| Intercepting route `(.)patients/[id]` | `app/(clinic)/@modal/(.)patients/[id]/page.tsx` |
| Middleware: auth gate, redirect with `?from=` | `middleware.ts` |
| Config redirects and security headers | `next.config.ts` |

**Rendering and data**

| Concept | File |
| --- | --- |
| Server Component fetching data directly | `app/(clinic)/page.tsx` |
| Client Component (`"use client"`), URL as state | `components/search-field.tsx` |
| Streaming with `<Suspense>` + skeleton | `app/(clinic)/patients/page.tsx` |
| Route-level loading UI | `app/(clinic)/patients/loading.tsx` |
| `cookies()` making a page dynamic | `lib/auth.ts`, used by `app/(clinic)/page.tsx` |
| ISR: `generateStaticParams` + `revalidate` | `app/(clinic)/patients/[id]/page.tsx` |
| Data Cache: `unstable_cache` with tags | `lib/data.ts` |
| Request de-duplication with React `cache()` | `lib/data.ts` (`getPatient`) |
| `server-only` guard | `lib/data.ts`, `lib/auth.ts` |
| Route Handler (JSON API) | `app/api/patients/route.ts` |

**Mutations and forms**

| Concept | File |
| --- | --- |
| Server Actions, validation, `revalidateTag`, `redirect` | `lib/actions.ts` |
| Setting and deleting cookies, reading `headers()` | `lib/actions.ts` (`signIn`, `signOut`) |
| `after()` for work after the response (audit log) | `lib/actions.ts` |
| `useActionState` / `useFormStatus` | `components/booking-form.tsx`, `components/login-form.tsx` |
| `useOptimistic` | `components/appointment-book.tsx` |

**Assets, metadata and errors**

| Concept | File |
| --- | --- |
| `next/font` | `app/layout.tsx` |
| `next/image` with static import, blur placeholder, `sizes` | `app/(auth)/layout.tsx` |
| Generated favicon and Open Graph image (`ImageResponse`) | `app/icon.tsx`, `app/opengraph-image.tsx` |
| `robots.txt` and `sitemap.xml` | `app/robots.ts`, `app/sitemap.ts` |
| Server-only vs `NEXT_PUBLIC_` env variables | `lib/actions.ts`, `components/login-form.tsx`, `.env.example` |
| Error boundary | `app/(clinic)/error.tsx` |
| Root-layout error boundary | `app/global-error.tsx` |
| 404s: app-wide and per segment | `app/not-found.tsx`, `app/(clinic)/patients/[id]/not-found.tsx` |


  a real app would use signed, expiring sessions (e.g. Auth.js) and check
  permissions per record, not only per page.
