"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { normalizeLoginCode } from "@/lib/telegram-login-code";

// Derived per-request rather than configured, so confirmation links work on
// localhost, preview deploys and production without extra setup.
async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3200";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    // Send the confirmation click to a route that can exchange it for a
    // session, instead of the app root where the code would be discarded.
    options: { emailRedirectTo: `${await origin()}/auth/callback?next=/onboarding` },
  });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  redirect(
    `/login?message=${encodeURIComponent(
      "Check your email — click the confirmation link and you'll be signed straight in."
    )}`
  );
}

export async function signOut() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// Telegram-only accounts have no real email — Supabase Auth still needs one
// internally to mint a session, so each gets a synthetic, never-shown
// address scoped to that Telegram user id. Nobody ever sees or types this.
function telegramSyntheticEmail(telegramUserId: number): string {
  return `tg-${telegramUserId}@telegram.foydami.internal`;
}

const CODE_ERROR = "That code is invalid or has expired. Send /start login to the bot again.";
const GENERIC_ERROR = "Something went wrong signing you in. Please try again.";

// Redeems the pairing code the bot sent, then signs the user in exactly the
// way an email confirmation does — an admin-generated magic link handed to
// the existing /auth/callback route — so every other auth path (RLS,
// getCurrentUser, requireOnboardedAccount) stays untouched by this being a
// second sign-in method.
export async function verifyTelegramCode(formData: FormData) {
  const code = normalizeLoginCode(String(formData.get("code") ?? ""));
  if (!code) {
    redirect(`/login/telegram?error=${encodeURIComponent(CODE_ERROR)}`);
  }

  const admin = createAdminClient();

  const { data: pending } = await admin
    .from("telegram_login_codes")
    .select("id, telegram_user_id, telegram_username, expires_at, consumed_at")
    .eq("code", code)
    .maybeSingle();

  if (!pending || pending.consumed_at || new Date(pending.expires_at) < new Date()) {
    redirect(`/login/telegram?error=${encodeURIComponent(CODE_ERROR)}`);
  }

  // Consume immediately so the same code can't be redeemed twice, even if
  // something below fails.
  await admin
    .from("telegram_login_codes")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", pending.id);

  const email = telegramSyntheticEmail(pending.telegram_user_id);

  const { data: existingAccount } = await admin
    .from("accounts")
    .select("owner_user_id")
    .eq("telegram_user_id", pending.telegram_user_id)
    .maybeSingle();

  let userId: string;
  if (existingAccount) {
    userId = existingAccount.owner_user_id;
  } else {
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      password: crypto.randomUUID(),
      user_metadata: {
        telegram_user_id: pending.telegram_user_id,
        telegram_username: pending.telegram_username,
      },
    });
    if (createErr || !created.user) {
      redirect(`/login/telegram?error=${encodeURIComponent(GENERIC_ERROR)}`);
    }
    userId = created.user.id;

    const { error: insertErr } = await admin.from("accounts").insert({
      name: pending.telegram_username ? `@${pending.telegram_username}` : "My Account",
      owner_user_id: userId,
      telegram_user_id: pending.telegram_user_id,
      telegram_username: pending.telegram_username,
    });
    if (insertErr) redirect(`/login/telegram?error=${encodeURIComponent(GENERIC_ERROR)}`);
  }

  const { data: link, error: linkErr } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  const hashedToken = link?.properties?.hashed_token;
  if (linkErr || !hashedToken) {
    redirect(`/login/telegram?error=${encodeURIComponent(GENERIC_ERROR)}`);
  }

  const next = existingAccount ? "/dashboard" : "/onboarding";
  redirect(
    `/auth/callback?token_hash=${encodeURIComponent(hashedToken)}&type=magiclink&next=${encodeURIComponent(next)}`
  );
}
