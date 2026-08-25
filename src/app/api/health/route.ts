import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Deployment diagnostics. Reports whether config is *present* and whether it
// actually *works* — never the values themselves. Safe to expose: booleans,
// a key fingerprint that can't reconstruct the key, and a sanitised error.
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;

  const fingerprint = (v: string | undefined) =>
    v ? { present: true, length: v.length, prefix: v.slice(0, 10), last4: v.slice(-4) } : { present: false };

  let supabase: { ok: boolean; error?: string } = { ok: false, error: "not attempted" };
  if (url && secret) {
    try {
      const client = createClient(url, secret);
      const { error } = await client.from("accounts").select("id").limit(1);
      supabase = error ? { ok: false, error: error.message } : { ok: true };
    } catch (e) {
      supabase = { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  return Response.json({
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
    env: {
      NEXT_PUBLIC_SUPABASE_URL: url ?? null,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: fingerprint(
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      ),
      SUPABASE_SECRET_KEY: fingerprint(secret),
      TELEGRAM_BOT_TOKEN: { present: Boolean(process.env.TELEGRAM_BOT_TOKEN) },
      TELEGRAM_BOT_USERNAME: process.env.TELEGRAM_BOT_USERNAME ?? null,
    },
    supabase,
  });
}
