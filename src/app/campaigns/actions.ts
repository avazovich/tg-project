"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser, ensureAccount } from "@/lib/account";
import { createAdminClient } from "@/lib/supabase-admin";
import { createChatInviteLink } from "@/lib/telegram";

const SOURCE_CATEGORIES = new Set(["paid_ad", "influencer", "organic", "cross_promo", "other"]);

export async function createCampaign(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const accountId = await ensureAccount(user!.id, user!.email);
  const admin = createAdminClient();

  const channelId = String(formData.get("channelId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const sourceCategory = String(formData.get("sourceCategory") ?? "other");
  const budgetRaw = String(formData.get("budget") ?? "").trim();
  const budget = budgetRaw ? Number(budgetRaw) : null;

  if (!channelId || !name || !SOURCE_CATEGORIES.has(sourceCategory)) {
    redirect("/stats?error=" + encodeURIComponent("Missing or invalid campaign fields"));
  }

  // Ownership check: the channel must belong to this user's account.
  const { data: channel, error: channelError } = await admin
    .from("channels")
    .select("id, telegram_chat_id")
    .eq("id", channelId)
    .eq("account_id", accountId)
    .single();
  if (channelError || !channel) {
    redirect("/stats?error=" + encodeURIComponent("Channel not found"));
  }

  const inviteLink = await createChatInviteLink(channel!.telegram_chat_id, name);

  const { error: insertError } = await admin.from("campaigns").insert({
    account_id: accountId,
    channel_id: channelId,
    name,
    source_category: sourceCategory,
    budget,
    invite_link_url: inviteLink.invite_link,
  });
  if (insertError) throw insertError;

  revalidatePath("/stats");
  redirect("/stats");
}

export async function setCampaignStatus(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const accountId = await ensureAccount(user!.id, user!.email);
  const admin = createAdminClient();

  const campaignId = String(formData.get("campaignId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["active", "paused", "archived"].includes(status)) redirect("/stats");

  await admin
    .from("campaigns")
    .update({ status })
    .eq("id", campaignId)
    .eq("account_id", accountId);

  revalidatePath("/stats");
  redirect("/stats");
}

// Name and ad cost are editable after the fact — spend is often only known
// once an ad has finished running. The invite link is deliberately NOT
// editable, since changing it would orphan every join already attributed.
export async function updateCampaign(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const accountId = await ensureAccount(user!.id, user!.email);
  const admin = createAdminClient();

  const campaignId = String(formData.get("campaignId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const budgetRaw = String(formData.get("budget") ?? "").trim();
  const sourceCategory = String(formData.get("sourceCategory") ?? "");

  if (!campaignId || !name) {
    redirect("/stats?error=" + encodeURIComponent("Campaign name cannot be empty"));
  }

  const budget = budgetRaw === "" ? null : Number(budgetRaw);
  if (budget !== null && (Number.isNaN(budget) || budget < 0)) {
    redirect("/stats?error=" + encodeURIComponent("Ad cost must be a positive number"));
  }

  const updates: Record<string, unknown> = { name, budget };
  if (SOURCE_CATEGORIES.has(sourceCategory)) updates.source_category = sourceCategory;

  const { error } = await admin
    .from("campaigns")
    .update(updates)
    .eq("id", campaignId)
    .eq("account_id", accountId);
  if (error) throw error;

  revalidatePath("/stats");
  revalidatePath("/");
  redirect("/stats");
}
