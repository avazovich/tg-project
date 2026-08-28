import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function getCurrentUser() {
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) return null;
  return {
    id: data.claims.sub as string,
    email: (data.claims.email as string | undefined) ?? undefined,
  };
}

// Idempotent: returns the existing account if the user already has one.
export async function ensureAccount(userId: string, email?: string): Promise<string> {
  const admin = createAdminClient();

  const { data: existing, error: lookupError } = await admin
    .from("accounts")
    .select("id")
    .eq("owner_user_id", userId)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) return existing.id as string;

  const { data: created, error: insertError } = await admin
    .from("accounts")
    .insert({ name: email ?? "My Account", owner_user_id: userId })
    .select("id")
    .single();
  if (insertError) throw insertError;
  return created.id as string;
}

export type Channel = {
  id: string;
  name: string;
  telegram_chat_id: number;
  bot_status: string;
  created_at: string;
};

// Cached per-request: safe to call from the layout and every page without
// re-querying. Redirects if not logged in or not past onboarding yet.
// The app operates against one "active" channel at a time (switched
// explicitly in Settings) rather than aggregating across all of them.
export const requireOnboardedAccount = cache(async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const accountId = await ensureAccount(user.id, user.email);
  const admin = createAdminClient();

  const [{ data: account }, { data: channels }] = await Promise.all([
    admin
      .from("accounts")
      .select("display_name, avatar_url, active_channel_id, is_platform_admin, telegram_username")
      .eq("id", accountId)
      .single(),
    admin
      .from("channels")
      .select("id, name, telegram_chat_id, bot_status, created_at")
      .eq("account_id", accountId)
      .order("created_at", { ascending: true }),
  ]);

  if (!channels || channels.length === 0) redirect("/onboarding");

  const activeChannel: Channel =
    channels.find((c) => c.id === account?.active_channel_id) ?? channels[0];

  if (account?.active_channel_id !== activeChannel.id) {
    await admin.from("accounts").update({ active_channel_id: activeChannel.id }).eq("id", accountId);
  }

  // A Telegram-only account has no real email — fall back to their @username
  // rather than showing the internal synthetic address anywhere in the UI.
  const telegramUsername = account?.telegram_username ?? null;
  const identityLabel = telegramUsername ? `@${telegramUsername}` : (user.email ?? "");

  return {
    user,
    accountId,
    channels: channels as Channel[],
    activeChannel,
    displayName: account?.display_name ?? null,
    avatarUrl: account?.avatar_url ?? null,
    isPlatformAdmin: Boolean(account?.is_platform_admin),
    identityLabel,
    telegramUsername,
  };
});
