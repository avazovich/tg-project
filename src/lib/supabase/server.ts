import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Respects RLS (uses the publishable key + the caller's session cookies).
// For Server Components and Server Actions that need the current user.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component with no writable cookies —
            // fine as long as proxy.ts is refreshing the session.
          }
        },
      },
    }
  );
}
