/**
 * Constrain a caller-supplied redirect target to this application.
 *
 * Confirmation links carry a `next` parameter through an email, so an
 * unchecked value here would let anyone craft a Foydami link that lands the
 * victim on a site they control — with the trust of having just clicked
 * something in a genuine Foydami email.
 */
export function safeNext(raw: string | null | undefined, fallback = "/"): string {
  if (!raw) return fallback;
  // Must be a rooted path. "//host" and "/\\host" are protocol-relative URLs
  // that browsers happily treat as absolute, so they are rejected too.
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  // A backslash can be normalised to "/" by some browsers before the origin.
  if (raw.includes("\\")) return fallback;
  return raw;
}
