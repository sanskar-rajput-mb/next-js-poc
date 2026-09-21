# MedTrack POC — learnings and outcomes

**Stack:** Next.js 15.5 (App Router), React 19, TypeScript, plain CSS. No database, no UI library.
**Question the POC set out to answer:** can the App Router carry a realistic clinic workflow (sign in → triage overview → find a patient → view record → book an appointment) with less client code and fewer moving parts than a classic SPA + REST API?

## TL;DR

- **Yes, for this shape of app.** The whole workflow runs with three small interactive pieces in the browser (search box, forms, modal). Everything else is server-rendered, and no page has a client-side data-fetching layer.
- **The feature coverage is broad.** Every major stable App Router feature is exercised somewhere in the code. The concept → file map is in the [README](../README.md#what-each-concept-lives-in).
- **Caching is the part that needs the most care.** It gave the biggest wins (prebuilt patient records, one-line invalidation after a booking) and also caused the least obvious bugs. Budget design time for it on a real project.
- **It isn't production-ready.** It has fake auth, in-memory data, no tests and no per-record authorisation. See [Gaps before production](#gaps-before-production).

## Outcomes

### What was built

| Screen | Behaviour |
| --- | --- |
| Sign in | Clinician + password. Middleware gates every other route and returns to the requested page afterwards. |
| Overview | Greets the signed-in clinician. Shows triage counts, the next appointments, and urgent/review patients. |
| Patient register | Search is kept in the URL, so it can be shared and bookmarked. The list streams in behind a skeleton. |
| Patient quick view | A modal opened from any patient link. The URL still changes, and reloading it shows the full page. |
| Patient record | Prebuilt at build time and refreshed in the background (ISR). Shows the patient's appointments. |
| Appointments | Schedule plus a booking form. New rows appear instantly (optimistic) and roll back if the server rejects them. |

### Measured results (production build)

| Metric | Result |
| --- | --- |
| Rendering mix | `○` static: icon, OG image, robots, sitemap. `●` ISR: 5 patient records, 60 s revalidate. `ƒ` dynamic: overview, register, appointments, login, API. |
| First-load JS per route | 102–107 kB. 102 kB of that is the shared framework baseline, so page code is 0.2–5 kB. |
| Middleware bundle | 33.8 kB |
| Login hero image | 58 kB JPEG source served as a 3.7 kB WebP at 640 px wide by `next/image` |
| End-to-end flow | Sign-in, redirect-back, modal open/close, optimistic booking, rejected booking, ISR refresh after booking and sign-out: all passed with no console errors. This was a one-off scripted run, not a checked-in test suite. |

## Learnings

### 1. Server Components change where the code lives

- Pages call the data layer directly (`await getPatients()`). There's no API route, fetch wrapper or client state for reads. The one Route Handler (`/api/patients`) exists only for outside consumers.
- `"use client"` marks a **boundary**, not a single component. Everything imported below it ships to the browser. Keeping the boundary low (the nav links, not the whole header) is what keeps page JS at a few kB.
- `import "server-only"` in `lib/data.ts` and `lib/auth.ts` turns an accidental client import of patient data into a **build error**. We recommend this for any module that touches PHI or secrets.

### 2. Caching: the biggest win and the biggest trap

The App Router has several caches, and each one decides something different:

| Layer | What we used | Controls |
| --- | --- | --- |
| Request de-dupe | React `cache()` on `getPatient` | `generateMetadata` and the page share one lookup per request |
| Data Cache | `unstable_cache` with tags | Results shared across requests and users, persisted to disk |
| Full Route Cache | `generateStaticParams` + `revalidate = 60` | Prerendered HTML for patient records |
| Invalidation | `revalidateTag("appointments")` in the booking action | Clears the tagged data *and* every page built from it |

The gotchas we actually hit:

- **The Data Cache outlives the process.** It's stored under `.next/cache`, so after a restart the in-memory "database" reset but cached results didn't. We fixed it with a per-boot ID in the cache key. With a real database this goes away, but it shows that **cache keys must include everything the result depends on.**
- **Reading `cookies()` makes the whole route dynamic.** Showing the clinician's name in the shared header would have turned every page, including the prerendered records, into per-request renders. So the header only has a sign-out button, and the greeting lives on the overview, which is dynamic anyway. **Decide early where user-specific UI goes.** It affects the caching of everything under it.
- **`revalidateTag` beats `revalidatePath`** once more than one page shows the same data. One tag refreshes the overview, the schedule and each patient record.
- The build output symbols (`○ ● ƒ`) are the fastest way to check a caching decision. **Check them in code review.**

### 3. Middleware is the right place for the auth gate, and only the gate

- It runs before the cache, so **private pages can still be static HTML**. This was the most useful single insight from the POC.
- It runs in a restricted runtime and can't import `next/headers` or server-only modules. We had to split the cookie name into `lib/session.ts`, a module with no server imports. **Keep middleware tiny and dependency-free.**
- It only checks that a session exists. Deciding which records a user may see still belongs in the data layer.
- Redirect targets taken from `?from=` must be validated (`safeRedirect`), or the login page becomes an open redirect.

### 4. Server Actions + React 19 form hooks replace most form plumbing

- `useActionState` holds errors, `useFormStatus` handles pending state, and validation runs on the server. There's no fetch code, API endpoint or loading flag.
- `useOptimistic` only works if the optimistic update runs **inside the action's transition**. We call it from the form's action wrapper, not from `onSubmit`. It rolls back automatically when the action returns an error.
- `after()` is a good fit for audit logging, which will matter for a medical product: the log write happens after the response is sent.

### 5. Advanced routing features are powerful but fiddly

- **The patient modal needs three pieces working together:** a parallel route (`@modal`), an intercepting route (`(.)patients/[id]`), and a catch-all that renders `null`. Without the catch-all, the modal stays open when you navigate elsewhere by client-side routing.
- **The "Open full record" link inside the modal must be a plain `<a>`.** A `<Link>` would be intercepted again and reopen the modal.
- **Route groups change which layout applies to special files.** After moving pages into `(clinic)`, the root `not-found.tsx` renders without the app header, and `error.tsx` had to move into the group to keep it.

### 6. Smaller practical notes

- **`params`, `searchParams`, `cookies()` and `headers()` are all Promises in Next 15.** Forgetting `await` is the most common upgrade error.
- **Dates:** `"YYYY-MM-DD"` strings must be parsed and formatted in UTC, or dates are off by one day in some timezones (`lib/format.ts`).
- **Images:** `next/image` does not optimise SVGs, so the showcase uses a raster image. A static import gives width, height and a blur placeholder for free.
- **`next/font` downloads the font at build time,** so builds need network access (or use `next/font/local`).
- **Don't run `next build` while `next dev` is running in the same folder.** Both write `.next/`, and the dev server breaks with "Cannot find module". The fix is `rm -rf .next`.
- **Environment variables:** only `NEXT_PUBLIC_*` values reach the browser, and they're baked in at **build** time. Changing one requires a rebuild, not just a restart.

## Gaps before production

| Area | Current state | Needed |
| --- | --- | --- |
| Auth | The cookie holds the clinician's name; there's one shared password | A real identity provider (e.g. Auth.js/OIDC), signed and expiring sessions, `secure` cookies over HTTPS |
| Authorisation | Only checks that someone is signed in | Per-record access checks in the data layer, plus role separation (clinician vs front desk) |
| Data | An in-memory array that resets on restart | A database or EHR integration (e.g. FHIR), with migrations |
| Data model | Appointments link to patients **by name** | Link by patient ID; the booking form should pick a patient, not accept free text |
| Audit | `console.info` via `after()` | A durable, tamper-evident audit store |
| Testing | None checked in | Unit tests for actions/validation and E2E coverage of the core flow |
| Compliance | Not considered | HIPAA/GDPR review, hosting, logging of PHI, retention |
| Accessibility | Semantic HTML, focus styles, reduced-motion support | A formal audit (screen reader pass, contrast check) |

## Recommendations

1. **Adopt the App Router for similar internal tools.** The reduction in client code and plumbing was real, and the concepts map well onto CRUD plus workflow screens.
2. **Write a caching policy per route before building screens.** Decide static / ISR / dynamic and the cache tags up front, and check the build output in code review.
3. **Treat `server-only` and middleware-plus-data-layer authorisation as defaults** for anything that handles patient data.
4. **Plan for the Next.js 16 upgrade.** Stable `"use cache"` / Partial Prerendering would replace `unstable_cache` and loosen the "cookies make the whole route dynamic" limitation. Middleware is also renamed to `proxy`. Confirm the details against the upgrade guide before starting.
5. **Next POC step:** swap `lib/data.ts` for a real database behind the same function signatures. Pages and actions shouldn't need to change, which is itself a useful test of the architecture.
