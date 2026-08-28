// No "server-only" guard: this is pure string generation with no I/O, kept
// importable from the test suite the same way click-tracking.ts is.

// Excludes visually ambiguous characters (0/O, 1/I/L) — this is read off a
// phone screen and typed back on a different device.
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

function part(): string {
  let out = "";
  for (let i = 0; i < 3; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

export function generateLoginCode(): string {
  return `${part()}-${part()}`;
}

// Lenient on input: strips whitespace/case/the dash so "8f4 k29", "8f4k29"
// and "8F4-K29" all match what the bot displayed. Returns "" for anything
// that isn't exactly 6 code characters once stripped.
export function normalizeLoginCode(input: string): string {
  const stripped = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (stripped.length !== 6) return "";
  return `${stripped.slice(0, 3)}-${stripped.slice(3)}`;
}
