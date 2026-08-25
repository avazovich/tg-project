import "server-only";
import { createClient } from "@supabase/supabase-js";

// Server-only: uses the secret key, bypasses RLS. Never import this from a
// client component — "server-only" makes that a build-time error.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}
