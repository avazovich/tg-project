"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser, ensureAccount } from "@/lib/account";
import { createAdminClient } from "@/lib/supabase-admin";
import { createChatInviteLink, describeTelegramError } from "@/lib/telegram";
import { generateClickSlug } from "@/lib/click-tracking";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";

const SOURCE_CATEGORIES = new Set(["paid_ad", "influencer", "organic", "cross_promo", "other"]);

const TOP_MINUTES = new Set([15, 30, 60, 120, 180, 360, 720, 1440]);
const FEED_HOURS = new Set([6, 12, 24, 48, 72, 168]);

// A placement is only meaningful with all three parts; a partial one would
// silently produce misleading window numbers, so treat it as "not set".
function readPlacement(formData: FormData) {
  const startRaw = String(formData.get("promoStartsAt") ?? "").trim();
  const top = Number(formData.get("topMinutes"));
  const feed = Number(formData.get("feedHours"));

  if (!startRaw || !TOP_MINUTES.has(top) || !FEED_HOURS.has(feed)) {
    return { promo_starts_at: null, top_minutes: null, feed_hours: null };
  }
  const start = new Date(startRaw);
  if (Number.isNaN(start.getTime())) {
    return { promo_starts_at: null, top_minutes: null, feed_hours: null };
  }
  return {
    promo_starts_at: start.toISOString(),
    top_minutes: top,
    feed_hours: feed,
  };
}


// click_slug is globally unique across all campaigns, so a fresh random slug
// can (rarely) collide with one already in use — retry a few times rather
// than fail the whole campaign creation over it.
async function uniqueClickSlug(admin: ReturnType<typeof createAdminClient>): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = generateClickSlug();
    const { data } = await admin
      .from("campaigns")
      .select("id")
      .eq("click_slug", slug)
      .maybeSingle();
    if (!data) return slug;
  }
  throw new Error("Could not generate a unique click-tracking slug");
}

export async function createCampaign(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const accountId = await ensureAccount(user!.id, user!.email);
  const admin = createAdminClient();
  const dict = await getDictionary(await getLocale());

  const channelId = String(formData.get("channelId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const sourceCategory = String(formData.get("sourceCategory") ?? "other");
  const budgetRaw = String(formData.get("budget") ?? "").trim();
  const budget = budgetRaw ? Number(budgetRaw) : null;

  if (!channelId || !name || !SOURCE_CATEGORIES.has(sourceCategory)) {
    redirect("/stats?error=" + encodeURIComponent(dict.errors.campaign.missingFields));
  }

  // Ownership check: the channel must belong to this user's account.
  const { data: channel, error: channelError } = await admin
    .from("channels")
    .select("id, telegram_chat_id")
    .eq("id", channelId)
    .eq("account_id", accountId)
    .single();
  if (channelError || !channel) {
    redirect("/stats?error=" + encodeURIComponent(dict.errors.campaign.channelNotFound));
  }

  // A Telegram-side failure here (most commonly: the bot is an admin but
  // wasn't granted "Invite Users via Link") must never reach the caller as
  // an unhandled exception — that's a blank page with no way forward.
  let inviteLink: { invite_link: string };
  try {
    inviteLink = await createChatInviteLink(channel!.telegram_chat_id, name);
  } catch (err) {
    redirect("/stats?error=" + encodeURIComponent(describeTelegramError(err, dict.errors.telegramApi)));
  }

  const trackClicks = formData.get("trackClicks") === "on";
  const clickSlug = trackClicks ? await uniqueClickSlug(admin) : null;

  const { error: insertError } = await admin.from("campaigns").insert({
    account_id: accountId,
    channel_id: channelId,
    name,
    source_category: sourceCategory,
    budget,
    invite_link_url: inviteLink.invite_link,
    click_slug: clickSlug,
    ...readPlacement(formData),
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
  const dict = await getDictionary(await getLocale());

  const campaignId = String(formData.get("campaignId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const budgetRaw = String(formData.get("budget") ?? "").trim();
  const sourceCategory = String(formData.get("sourceCategory") ?? "");

  if (!campaignId || !name) {
    redirect("/stats?error=" + encodeURIComponent(dict.errors.campaign.nameEmpty));
  }

  const budget = budgetRaw === "" ? null : Number(budgetRaw);
  if (budget !== null && (Number.isNaN(budget) || budget < 0)) {
    redirect("/stats?error=" + encodeURIComponent(dict.errors.campaign.invalidAdCost));
  }

  const updates: Record<string, unknown> = { name, budget, ...readPlacement(formData) };
  if (SOURCE_CATEGORIES.has(sourceCategory)) updates.source_category = sourceCategory;

  // One-way: tracking can be turned on for a campaign that doesn't have it
  // yet, but never turned off or regenerated — a link already handed out on
  // an ad would silently break.
  if (formData.get("trackClicks") === "on") {
    const { data: existing } = await admin
      .from("campaigns")
      .select("click_slug")
      .eq("id", campaignId)
      .eq("account_id", accountId)
      .single();
    if (existing && !existing.click_slug) {
      updates.click_slug = await uniqueClickSlug(admin);
    }
  }

  const { error } = await admin
    .from("campaigns")
    .update(updates)
    .eq("id", campaignId)
    .eq("account_id", accountId);
  if (error) throw error;

  revalidatePath("/stats");
  revalidatePath("/dashboard");
  redirect("/stats");
}
