// Pure — no server-only import, no I/O — kept importable from tests the same
// way click-tracking.ts and telegram-login-code.ts are.

export const LOCALES = ["en", "uz", "ru"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "foydami_locale";

export const LOCALE_LABEL: Record<Locale, string> = {
  en: "EN",
  uz: "UZ",
  ru: "RU",
};

// For Intl.DateTimeFormat / toLocaleString — a region tag actually changes
// formatting (day/month order, separators), unlike the bare app Locale.
export const INTL_LOCALE: Record<Locale, string> = {
  en: "en-US",
  uz: "uz-UZ",
  ru: "ru-RU",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

// Maps a raw "Accept-Language" (or Telegram's from.language_code, which is
// the same BCP-47 shape) header to one of our three locales. Anything
// unrecognised — including regional variants we don't special-case — falls
// back to the base language tag, then to the default.
export function resolveLocale(header: string | null | undefined): Locale {
  if (!header) return DEFAULT_LOCALE;
  const tags = header
    .split(",")
    .map((part) => part.split(";")[0].trim().toLowerCase())
    .filter(Boolean);
  for (const tag of tags) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}
