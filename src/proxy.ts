import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { LOCALE_COOKIE, resolveLocale } from "@/i18n/config";

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);

  // Set once, from the browser's own language list — after that the cookie
  // (changeable via the language switcher) is the single source of truth,
  // so a user who picks a language isn't overridden back on their next visit.
  if (!request.cookies.has(LOCALE_COOKIE)) {
    const locale = resolveLocale(request.headers.get("accept-language"));
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    // /l/* is the public click-redirect route: it needs to respond as fast
    // as possible to real ad traffic (and volume from it), so it skips the
    // auth proxy entirely rather than paying for a session check it never
    // uses.
    "/((?!_next/static|_next/image|favicon.ico|l/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
