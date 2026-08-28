import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
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
