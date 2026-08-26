// Public endpoint: Telegram calls this directly, with no Supabase API key.
// Caller identity is verified via Telegram's own secret token instead
// (see TELEGRAM_WEBHOOK_SECRET / setWebhook's secret_token param).
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const WEBHOOK_SECRET = Deno.env.get("TELEGRAM_WEBHOOK_SECRET");
const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");

const MEMBER_STATUSES = new Set(["member", "administrator", "creator"]);

function isActiveMember(status: string | undefined, isMember: boolean | undefined) {
  if (!status) return false;
  if (MEMBER_STATUSES.has(status)) return true;
  if (status === "restricted" && isMember) return true;
  return false;
}

const APP_URL = Deno.env.get("APP_URL") ?? "https://foydami.vercel.app";

async function sendMessage(
  chatId: number,
  text: string,
  buttons?: { text: string; url: string }[],
) {
  if (!BOT_TOKEN) return;
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
        ...(buttons?.length
          ? { reply_markup: { inline_keyboard: buttons.map((b) => [b]) } }
          : {}),
      }),
    });
  } catch (err) {
    console.error("sendMessage failed", err);
  }
}

// The bot is the only surface some users will ever open, so it has to answer
// for itself rather than going silent once a channel is connected.
async function handleBotCommand(admin: any, message: any) {
  const text = String(message.text ?? "").trim();
  const command = text.split(/\s+/)[0].split("@")[0].toLowerCase();
  const telegramUserId = message.from?.id;

  if (command === "/help" || command === "/start") {
    await sendMessage(
      message.chat.id,
      [
        "<b>Foydami</b> tells you which ads bring subscribers who actually stay.",
        "",
        "<b>/stats</b> — how your channels are doing right now",
        "<b>/links</b> — your campaign invite links",
        "<b>/help</b> — this message",
      ].join("\n"),
      [{ text: "Open dashboard", url: APP_URL }],
    );
    return;
  }

  if (command !== "/stats" && command !== "/links") return;

  // Map the Telegram user back to an account via the claim they completed.
  const { data: claim } = await admin
    .from("pending_channel_claims")
    .select("account_id")
    .eq("telegram_user_id", telegramUserId)
    .not("claimed_channel_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!claim) {
    await sendMessage(
      message.chat.id,
      "I don't have a channel linked to you yet. Connect one first and I'll start tracking.",
      [{ text: "Connect a channel", url: `${APP_URL}/onboarding` }],
    );
    return;
  }

  const { data: channels } = await admin
    .from("channels")
    .select("id, name, bot_status")
    .eq("account_id", claim.account_id);

  if (!channels?.length) {
    await sendMessage(message.chat.id, "No channels connected yet.", [
      { text: "Connect a channel", url: `${APP_URL}/onboarding` },
    ]);
    return;
  }

  if (command === "/links") {
    const { data: campaigns } = await admin
      .from("campaigns")
      .select("name, invite_link_url, status")
      .eq("account_id", claim.account_id)
      .eq("status", "active");

    const lines = campaigns?.length
      ? campaigns.map((c: any) => `• <b>${c.name}</b>\n${c.invite_link_url}`)
      : ["No active campaigns yet."];
    await sendMessage(
      message.chat.id,
      ["<b>Your campaign links</b>", "", ...lines].join("\n"),
      [{ text: "Manage campaigns", url: `${APP_URL}/stats` }],
    );
    return;
  }

  // /stats — last 24h per channel, kept short enough to read on a phone.
  const since = new Date(Date.now() - 86_400_000).toISOString();
  const lines: string[] = ["<b>Last 24 hours</b>", ""];
  for (const ch of channels) {
    const { data: evs } = await admin
      .from("member_events")
      .select("event_type, campaign_id")
      .eq("channel_id", ch.id)
      .gte("event_timestamp", since);
    const joined = evs?.filter((e: any) => e.event_type === "joined").length ?? 0;
    const left = (evs?.length ?? 0) - joined;
    const attributed =
      evs?.filter((e: any) => e.event_type === "joined" && e.campaign_id).length ?? 0;
    lines.push(
      `<b>${ch.name}</b>`,
      `+${joined} joined · −${left} left · net ${joined - left >= 0 ? "+" : ""}${joined - left}`,
      `${attributed} from campaigns, ${joined - attributed} organic`,
      "",
    );
  }
  await sendMessage(message.chat.id, lines.join("\n"), [
    { text: "Full dashboard", url: APP_URL },
  ]);
}

// Only looks up existing channels — creation now happens exclusively via
// the my_chat_member claim flow below, so we know which account owns it.
async function findChannel(admin: any, telegramChatId: number) {
  const { data } = await admin
    .from("channels")
    .select("id, account_id")
    .eq("telegram_chat_id", telegramChatId)
    .maybeSingle();
  return data;
}

// Handles "/start <claim_code>" DMs: links a claim to the Telegram user who
// sent it, so we can later match that same user performing the "add bot as
// admin" action on a channel.
async function handleStartCommand(admin: any, message: any) {
  const text = String(message.text ?? "");
  const parts = text.trim().split(/\s+/);
  if (parts[0] !== "/start" || !parts[1]) return;
  const claimCode = parts[1];

  const { data: claim } = await admin
    .from("pending_channel_claims")
    .select("id, expires_at, claimed_channel_id")
    .eq("claim_code", claimCode)
    .maybeSingle();

  if (!claim || claim.claimed_channel_id || new Date(claim.expires_at) < new Date()) {
    await sendMessage(message.chat.id, "That link has expired — go back and try connecting again.");
    return;
  }

  await admin
    .from("pending_channel_claims")
    .update({ telegram_user_id: message.from.id })
    .eq("id", claim.id);

  await sendMessage(
    message.chat.id,
    "Got it! Now add me as admin to your channel and I'll detect it automatically."
  );
}

// Handles the bot's own membership status changing in a chat: added as
// admin (claim a channel for whoever just linked their Telegram account),
// or removed (mark the channel's bot connection as broken).
async function handleMyChatMember(admin: any, myChatMember: any) {
  const chat = myChatMember.chat;
  if (chat.type !== "channel") return;

  const newStatus = myChatMember.new_chat_member?.status;
  const actorId = myChatMember.from?.id;

  if (newStatus === "administrator" && actorId) {
    const { data: claim } = await admin
      .from("pending_channel_claims")
      .select("id, account_id, telegram_user_id")
      .eq("telegram_user_id", actorId)
      .is("claimed_channel_id", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!claim) return; // Bot added somewhere with no matching in-flight claim — ignore.

    const { data: channel, error } = await admin
      .from("channels")
      .upsert(
        {
          account_id: claim.account_id,
          telegram_chat_id: chat.id,
          name: chat.title ?? String(chat.id),
          bot_status: "active",
        },
        { onConflict: "telegram_chat_id" }
      )
      .select("id")
      .single();
    if (error) throw error;

    await admin
      .from("pending_channel_claims")
      .update({ claimed_channel_id: channel.id })
      .eq("id", claim.id);

    // Without this the bot goes silent exactly when the user is most engaged.
    if (claim.telegram_user_id) {
      await sendMessage(
        claim.telegram_user_id,
        [
          `✅ <b>${chat.title ?? "Your channel"}</b> is connected.`,
          "",
          "I'm now tracking every join and leave. Next: create a campaign so joins can be traced back to the ad that earned them.",
          "",
          "Send /stats any time for a 24-hour summary, or /links for your invite links.",
        ].join("\n"),
        [{ text: "Create a campaign", url: `${APP_URL}/stats` }],
      );
    }
    return;
  }

  if (newStatus === "left" || newStatus === "kicked") {
    await admin.from("channels").update({ bot_status: "removed" }).eq("telegram_chat_id", chat.id);
    if (actorId) {
      await sendMessage(
        actorId,
        [
          `⚠️ I was removed as admin from <b>${chat.title ?? "your channel"}</b>.`,
          "",
          "Tracking has stopped — joins from now on won't be recorded, and that gap can't be backfilled later.",
        ].join("\n"),
        [{ text: "Reconnect", url: `${APP_URL}/onboarding` }],
      );
    }
  }
}

export default {
  fetch: withSupabase({ auth: "none" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const secretHeader = req.headers.get("X-Telegram-Bot-Api-Secret-Token");
    if (!WEBHOOK_SECRET || secretHeader !== WEBHOOK_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }

    const update = await req.json();

    try {
      const messageText = String(update.message?.text ?? "").trim();
      if (messageText.startsWith("/")) {
        // "/start <code>" is the channel-claim handshake; every other command
        // (including a bare /start) is a normal bot interaction.
        if (messageText.startsWith("/start ")) {
          await handleStartCommand(ctx.supabaseAdmin, update.message);
        } else {
          await handleBotCommand(ctx.supabaseAdmin, update.message);
        }
        return Response.json({ ok: true });
      }

      if (update.my_chat_member) {
        await handleMyChatMember(ctx.supabaseAdmin, update.my_chat_member);
        return Response.json({ ok: true });
      }

      const chatMember = update.chat_member;
      if (!chatMember) {
        return Response.json({ ok: true });
      }

      const oldStatus = chatMember.old_chat_member?.status;
      const newStatus = chatMember.new_chat_member?.status;
      const wasMember = isActiveMember(oldStatus, chatMember.old_chat_member?.is_member);
      const nowMember = isActiveMember(newStatus, chatMember.new_chat_member?.is_member);

      let eventType: "joined" | "left" | "kicked" | null = null;
      if (!wasMember && nowMember) eventType = "joined";
      else if (wasMember && newStatus === "left") eventType = "left";
      else if (wasMember && newStatus === "kicked") eventType = "kicked";

      if (!eventType) {
        return Response.json({ ok: true });
      }

      const channel = await findChannel(ctx.supabaseAdmin, chatMember.chat.id);
      if (!channel) {
        // Unclaimed channel — nothing to attribute this to.
        return Response.json({ ok: true });
      }

      let campaignId: string | null = null;
      const inviteLinkUrl = chatMember.invite_link?.invite_link;
      if (inviteLinkUrl) {
        const { data: campaign } = await ctx.supabaseAdmin
          .from("campaigns")
          .select("id")
          .eq("invite_link_url", inviteLinkUrl)
          .maybeSingle();
        campaignId = campaign?.id ?? null;
      }

      const { error: insertError } = await ctx.supabaseAdmin.from("member_events").insert({
        account_id: channel.account_id,
        channel_id: channel.id,
        telegram_user_id: chatMember.new_chat_member.user.id,
        campaign_id: campaignId,
        event_type: eventType,
        event_timestamp: new Date(chatMember.date * 1000).toISOString(),
        telegram_update_id: update.update_id,
        raw_payload: update,
      });

      if (insertError) {
        // Telegram retried a delivery we already recorded — not an error.
        if (insertError.code === "23505") {
          return Response.json({ ok: true, duplicate: true });
        }
        throw insertError;
      }

      return Response.json({ ok: true });
    } catch (err) {
      console.error(err);
      return new Response("internal error", { status: 500 });
    }
  }),
};
