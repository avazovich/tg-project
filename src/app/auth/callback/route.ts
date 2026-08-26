import { redirect } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/safe-redirect";

const FAILED =
  "That confirmation link has expired or was already used. Sign in below, or sign up again to get a new one.";

/**
 * Lands the click from a confirmation email and turns it into a real session.
 *
 * Without this the account gets confirmed but the browser arrives with no
 * session cookie, so the proxy bounces straight back to the login form and a
 * successful confirmation looks like it did nothing.
 *
 * Handles both shapes Supabase can send: `?code=` (the PKCE flow used by
 * @supabase/ssr, which is what the default email template produces) and
 * `?token_hash=&type=`, which a customised template would use.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const next = safeNext(searchParams.get("next"), "/dashboard");

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) redirect(`/login?error=${encodeURIComponent(FAILED)}`);
    redirect(next);
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error) redirect(`/login?error=${encodeURIComponent(FAILED)}`);
    redirect(next);
  }

  redirect(
    `/login?error=${encodeURIComponent("That confirmation link is incomplete. Try signing in, or sign up again.")}`
  );
}
