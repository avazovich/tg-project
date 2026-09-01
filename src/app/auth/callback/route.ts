import { redirect } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/safe-redirect";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";

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
  const dict = await getDictionary(await getLocale());
  const FAILED = dict.errors.auth.confirmationExpired;

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

  redirect(`/login?error=${encodeURIComponent(dict.errors.auth.confirmationIncomplete)}`);
}
