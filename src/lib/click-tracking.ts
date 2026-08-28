// No "server-only" guard: this is pure string matching with no secrets and
// no I/O, kept importable from the test suite the same way telegram-errors.ts
// is — see that file for why server-only would block that.

// When a campaign link is posted as a Telegram message, Telegram's own
// servers fetch it to build the link-preview card *before* any human taps
// it. Counting that as a click would inflate every campaign's numbers by
// one the instant it's posted, and inflate it again on re-shares/forwards.
// Same idea applies to every other platform's preview fetcher.
const BOT_SIGNATURES = [
  "telegrambot",
  "twitterbot",
  "facebookexternalhit",
  "whatsapp",
  "slackbot",
  "discordbot",
  "linkedinbot",
  "redditbot",
  "skypeuripreview",
  "googlebot",
  "bingbot",
  "yandexbot",
  "applebot",
  "pinterest",
  "embedly",
  "vkshare",
];

export function isLikelyLinkPreviewBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false; // no signal either way — don't drop a click on a guess
  const ua = userAgent.toLowerCase();
  if (BOT_SIGNATURES.some((sig) => ua.includes(sig))) return true;
  // Generic fallback for preview fetchers not on the explicit list. A real
  // browser's UA does not contain these words.
  return /\b(bot|crawler|spider|preview)\b/.test(ua);
}

const SLUG_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ";

// Excludes visually ambiguous characters (0/O, 1/l/I) since this is read
// off an ad, not copy-pasted — a human may need to type it.
export function generateClickSlug(length = 7): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += SLUG_ALPHABET[Math.floor(Math.random() * SLUG_ALPHABET.length)];
  }
  return out;
}

// NEXT_PUBLIC_SITE_URL isn't set in every environment (local dev), so this
// falls back to the one production domain the app is actually deployed at.
export function trackedLinkUrl(slug: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://foydami.vercel.app";
  return `${base.replace(/\/$/, "")}/l/${slug}`;
}
