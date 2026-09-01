import "server-only";
import en, { type Dictionary } from "./dictionaries/en";
import uz from "./dictionaries/uz";
import ru from "./dictionaries/ru";
import type { Locale } from "./config";

const DICTIONARIES: Record<Locale, Dictionary> = { en, uz, ru };

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return DICTIONARIES[locale];
}

export type { Dictionary };
