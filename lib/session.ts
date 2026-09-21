// The session is deliberately fake: the cookie just holds the clinician's name.
// A real app would store a signed, expiring token (or use an auth library such
// as Auth.js) and look the user up on every request.
//
// This file must stay free of server-only imports because middleware.ts, which
// runs before every request, imports it too.

export const SESSION_COOKIE = "medtrack_session";

// Only accept a redirect target that stays on this site — "/patients" is fine,
// "//evil.example" or "https://…" is an open redirect.
export function safeRedirect(target: string | null | undefined, fallback = "/") {
  return target && target.startsWith("/") && !target.startsWith("//") ? target : fallback;
}
