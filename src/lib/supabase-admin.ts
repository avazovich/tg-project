import "server-only";
import { createClient } from "@supabase/supabase-js";

// Without this guard a missing variable surfaces as an opaque 500 from deep
// inside supabase-js. Naming the exact variable turns a hosting misconfig
// into a one-line fix.
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. ` +
        `Set it in your hosting provider's environment settings (and make sure ` +
        `it is enabled for this environment), then redeploy.`
    );
  }
  return value;
}

// Server-only: uses the secret key, bypasses RLS. Never import this from a
// client component — "server-only" makes that a build-time error.
export function createAdminClient() {
  return createClient(
    required("NEXT_PUBLIC_SUPABASE_URL"),
    required("SUPABASE_SECRET_KEY")
  );
}
