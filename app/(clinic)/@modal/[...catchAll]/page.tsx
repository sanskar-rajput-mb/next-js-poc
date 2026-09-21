// On client-side navigation a slot keeps showing its last page until something
// replaces it. This catch-all matches every other URL and renders nothing, so
// the patient modal closes when you navigate away from it.
export default function CatchAll() {
  return null;
}
