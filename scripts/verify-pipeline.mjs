/**
 * End-to-end verification of the live ingestion pipeline.
 *
 * Drives the real deployed Telegram webhook with synthetic chat_member
 * updates and asserts what actually landed in the database — webhook auth,
 * attribution, deduplication, churn, and placement windows.
 *
 * Everything it creates is namespaced to a throwaway campaign and synthetic
 * Telegram user IDs, and is removed in a finally block so a failed run still
 * cleans up after itself. Run with: npm run verify
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")];
    })
);

const WEBHOOK_URL = `${env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/telegram-webhook`;
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY);

// Well outside the range Telegram actually issues, so these can never collide
// with a real subscriber.
const SYNTHETIC_USER_BASE = 990000000000;
const SYNTHETIC_UPDATE_BASE = 990000000;
const MARKER = `__verify__${Date.now()}`;

let passed = 0;
let failed = 0;
const check = (label, ok, detail = "") => {
  if (ok) {
    passed++;
    console.log(`  ✔ ${label}`);
  } else {
    failed++;
    console.log(`  ✖ ${label}${detail ? ` — ${detail}` : ""}`);
  }
};

async function postUpdate(body) {
  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Telegram-Bot-Api-Secret-Token": env.TELEGRAM_WEBHOOK_SECRET,
    },
    body: JSON.stringify(body),
  });
  return { status: res.status, json: await res.json().catch(() => null) };
}

function memberUpdate({ updateId, chatId, userId, from, to, inviteLink, at }) {
  return {
    update_id: updateId,
    chat_member: {
      chat: { id: chatId, type: "channel", title: "verify" },
      from: { id: userId, is_bot: false, first_name: "Verify" },
      date: Math.floor(at.getTime() / 1000),
      old_chat_member: { user: { id: userId, is_bot: false, first_name: "V" }, status: from },
      new_chat_member: { user: { id: userId, is_bot: false, first_name: "V" }, status: to },
      ...(inviteLink ? { invite_link: { invite_link: inviteLink } } : {}),
    },
  };
}

let campaignId = null;

try {
  console.log(`\nVerifying live pipeline at ${WEBHOOK_URL}\n`);

  // --- setup: a throwaway campaign on the account's first channel ----------
  const { data: channel } = await supabase
    .from("channels")
    .select("id, account_id, telegram_chat_id, name")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (!channel) throw new Error("no channel connected — nothing to verify against");
  console.log(`Using channel: ${channel.name} (${channel.telegram_chat_id})\n`);

  const promoStart = new Date(Date.now() - 3 * 3_600_000); // 3h ago
  const inviteLink = `https://t.me/+${MARKER}`;
  const { data: campaign, error: campaignErr } = await supabase
    .from("campaigns")
    .insert({
      account_id: channel.account_id,
      channel_id: channel.id,
      name: MARKER,
      source_category: "other",
      budget: 100,
      invite_link_url: inviteLink,
      promo_starts_at: promoStart.toISOString(),
      top_minutes: 60,
      feed_hours: 24,
    })
    .select("id")
    .single();
  if (campaignErr) throw campaignErr;
  campaignId = campaign.id;

  // --- 1. auth --------------------------------------------------------------
  console.log("Webhook authentication");
  const badSecret = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "content-type": "application/json", "X-Telegram-Bot-Api-Secret-Token": "wrong" },
    body: JSON.stringify({ update_id: 1 }),
  });
  check("rejects a wrong secret token", badSecret.status === 401, `got ${badSecret.status}`);

  const noSecret = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ update_id: 1 }),
  });
  check("rejects a missing secret token", noSecret.status === 401, `got ${noSecret.status}`);

  // --- 2. attributed join ---------------------------------------------------
  console.log("\nAttribution");
  const attributedUser = SYNTHETIC_USER_BASE + 1;
  const inTop = new Date(promoStart.getTime() + 10 * 60_000); // 10 min in => top slot
  await postUpdate(
    memberUpdate({
      updateId: SYNTHETIC_UPDATE_BASE + 1,
      chatId: channel.telegram_chat_id,
      userId: attributedUser,
      from: "left",
      to: "member",
      inviteLink,
      at: inTop,
    })
  );

  const { data: attributed } = await supabase
    .from("member_events")
    .select("campaign_id, event_type, account_id, channel_id")
    .eq("telegram_user_id", attributedUser)
    .maybeSingle();
  check("a join via a campaign link is recorded", Boolean(attributed));
  check("it is attributed to that campaign", attributed?.campaign_id === campaignId);
  check("it inherits the channel's account", attributed?.account_id === channel.account_id);

  // --- 3. idempotency -------------------------------------------------------
  console.log("\nDeduplication");
  const dup = await postUpdate(
    memberUpdate({
      updateId: SYNTHETIC_UPDATE_BASE + 1, // same update_id Telegram would retry with
      chatId: channel.telegram_chat_id,
      userId: attributedUser,
      from: "left",
      to: "member",
      inviteLink,
      at: inTop,
    })
  );
  check("a retried delivery reports duplicate", dup.json?.duplicate === true);
  const { count: dupCount } = await supabase
    .from("member_events")
    .select("*", { count: "exact", head: true })
    .eq("telegram_user_id", attributedUser);
  check("and does not double-count the join", dupCount === 1, `found ${dupCount}`);

  // --- 4. organic join ------------------------------------------------------
  console.log("\nOrganic joins");
  const organicUser = SYNTHETIC_USER_BASE + 2;
  await postUpdate(
    memberUpdate({
      updateId: SYNTHETIC_UPDATE_BASE + 2,
      chatId: channel.telegram_chat_id,
      userId: organicUser,
      from: "left",
      to: "member",
      at: new Date(promoStart.getTime() + 90 * 60_000), // 90 min in => feed window
    })
  );
  const { data: organic } = await supabase
    .from("member_events")
    .select("campaign_id")
    .eq("telegram_user_id", organicUser)
    .maybeSingle();
  check("a join with no invite link is recorded", Boolean(organic));
  check("and is left unattributed", organic?.campaign_id === null);

  // --- 5. churn -------------------------------------------------------------
  console.log("\nChurn");
  await postUpdate(
    memberUpdate({
      updateId: SYNTHETIC_UPDATE_BASE + 3,
      chatId: channel.telegram_chat_id,
      userId: organicUser,
      from: "member",
      to: "left",
      at: new Date(),
    })
  );
  const { data: churn } = await supabase
    .from("member_events")
    .select("event_type")
    .eq("telegram_user_id", organicUser)
    .eq("event_type", "left")
    .maybeSingle();
  check("a departure is recorded as a leave", churn?.event_type === "left");

  // --- 6. non-membership changes are ignored --------------------------------
  console.log("\nNoise rejection");
  const promotedUser = SYNTHETIC_USER_BASE + 3;
  await postUpdate(
    memberUpdate({
      updateId: SYNTHETIC_UPDATE_BASE + 4,
      chatId: channel.telegram_chat_id,
      userId: promotedUser,
      from: "member",
      to: "administrator", // a promotion, not a join
      at: new Date(),
    })
  );
  const { count: noiseCount } = await supabase
    .from("member_events")
    .select("*", { count: "exact", head: true })
    .eq("telegram_user_id", promotedUser);
  check("promoting an existing member creates no event", noiseCount === 0, `found ${noiseCount}`);

  // --- 7. placement windows over the real rows ------------------------------
  console.log("\nPlacement windows");
  const { computePlacement } = await import("../src/lib/retention.ts");
  const { data: campaignEvents } = await supabase
    .from("member_events")
    .select("telegram_user_id, event_type, event_timestamp")
    .eq("campaign_id", campaignId);
  const placement = computePlacement(campaignEvents ?? [], promoStart, 60, 24, new Date());
  check("the top-slot join lands in the top slot", placement.joinsInTop === 1);
  check("nothing is miscounted as post-window", placement.joinsAfter === 0);
} catch (err) {
  failed++;
  console.error("\n✖ verification aborted:", err.message);
} finally {
  // Always clean up, even on failure — this runs against the real database.
  const { error: evErr } = await supabase
    .from("member_events")
    .delete()
    .gte("telegram_user_id", SYNTHETIC_USER_BASE);
  if (campaignId) await supabase.from("campaigns").delete().eq("id", campaignId);

  const { count: leftover } = await supabase
    .from("member_events")
    .select("*", { count: "exact", head: true })
    .gte("telegram_user_id", SYNTHETIC_USER_BASE);
  console.log(
    `\nCleanup: ${evErr ? `FAILED (${evErr.message})` : "ok"}, synthetic rows remaining: ${leftover}`
  );

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}
