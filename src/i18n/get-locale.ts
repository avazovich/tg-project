import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./config";

// The proxy sets this cookie on first visit (from Accept-Language) so every
// later request — including Server Actions, which have no URL of their own
// to read a locale segment from — can resolve it with a single cookie read.
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
