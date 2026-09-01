"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { safeNext } from "@/lib/safe-redirect";
import { LOCALE_COOKIE, isLocale } from "./config";

export async function setLocale(formData: FormData) {
  const locale = String(formData.get("locale") ?? "");
  const next = safeNext(String(formData.get("next") ?? ""), "/");

  if (isLocale(locale)) {
    const store = await cookies();
    store.set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  redirect(next);
}
