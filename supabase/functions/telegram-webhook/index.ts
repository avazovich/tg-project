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

// Mirrors src/lib/telegram-login-code.ts — duplicated rather than shared
// since this edge function is a separate Deno deployment with its own
// bundling, not part of the Next.js build.
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
function generateLoginCode(): string {
  const part = () =>
    Array.from({ length: 3 }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join("");
  return `${part()}-${part()}`;
}

// Mirrors src/i18n/config.ts's locale resolution — duplicated for the same
// reason as generateLoginCode above. Telegram sends the user's own client
// language as `from.language_code` on every update, which is a far more
// reliable signal here than anything we could ask for, so the bot just
// speaks back in it directly with no setup step.
type Locale = "en" | "uz" | "ru";
function resolveLocale(languageCode: string | undefined | null): Locale {
  const base = (languageCode ?? "").toLowerCase().split("-")[0];
  if (base === "uz" || base === "ru") return base;
  return "en";
}

// Bot copy in all three locales. Duplicated from src/i18n/dictionaries/*
// rather than imported, for the same reason as above — kept to exactly the
// strings this bot sends, phrased for a chat rather than a web page.
const BOT_STRINGS = {
  en: {
    helpIntro: [
      "<b>Foydami</b> tells you which ads bring subscribers who actually stay.",
      "",
      "<b>/stats</b> — how your channels are doing right now",
      "<b>/links</b> — your campaign invite links",
      "<b>/help</b> — this message",
    ].join("\n"),
    openDashboard: "Open dashboard",
    noChannelLinked: "I don't have a channel linked to you yet. Connect one first and I'll start tracking.",
    connectChannel: "Connect a channel",
    noChannelsConnected: "No channels connected yet.",
    noActiveCampaigns: "No active campaigns yet.",
    yourCampaignLinks: "Your campaign links",
    manageCampaigns: "Manage campaigns",
    last24Hours: "Last 24 hours",
    statsLine: (joined: number, left: number, net: number) =>
      `+${joined} joined · −${left} left · net ${net >= 0 ? "+" : ""}${net}`,
    attributionLine: (attributed: number, organic: number) => `${attributed} from campaigns, ${organic} organic`,
    fullDashboard: "Full dashboard",
    welcome: (name: string) => `Welcome, ${name} 👋`,
    signInCodeLabel: "Your sign-in code:",
    signInCodeExpiry: "Enter it on the Foydami sign-in page to continue. It expires in 10 minutes.",
    codeGenFailed: "Something went wrong generating your code — try again.",
    claimExpired: "That link has expired — go back and try connecting again.",
    claimLinked: "Got it! Now add me as admin to your channel and I'll detect it automatically.",
    channelConnected: (name: string) => `✅ <b>${name}</b> is connected.`,
    channelConnectedBody:
      "I'm now tracking every join and leave. Next: create a campaign so joins can be traced back to the ad that earned them.",
    channelConnectedHint: "Send /stats any time for a 24-hour summary, or /links for your invite links.",
    createCampaign: "Create a campaign",
    channelRemoved: (name: string) => `⚠️ I was removed as admin from <b>${name}</b>.`,
    channelRemovedBody:
      "Tracking has stopped — joins from now on won't be recorded, and that gap can't be backfilled later.",
    reconnect: "Reconnect",
    yourChannel: "Your channel",
  },
  uz: {
    helpIntro: [
      "<b>Foydami</b> qaysi reklamalar chindan qoladigan obunachi keltirishini aytadi.",
      "",
      "<b>/stats</b> — kanallaringiz hozir qanday holatda",
      "<b>/links</b> — kampaniya taklif havolalaringiz",
      "<b>/help</b> — shu xabar",
    ].join("\n"),
    openDashboard: "Boshqaruv panelini ochish",
    noChannelLinked: "Sizga bog'langan kanal hali yo'q. Kuzatishni boshlashimdan oldin birini ulang.",
    connectChannel: "Kanal ulash",
    noChannelsConnected: "Hali ulangan kanallar yo'q.",
    noActiveCampaigns: "Hali faol kampaniyalar yo'q.",
    yourCampaignLinks: "Kampaniya havolalaringiz",
    manageCampaigns: "Kampaniyalarni boshqarish",
    last24Hours: "So'nggi 24 soat",
    statsLine: (joined: number, left: number, net: number) =>
      `+${joined} qo'shildi · −${left} chiqib ketdi · sof ${net >= 0 ? "+" : ""}${net}`,
    attributionLine: (attributed: number, organic: number) =>
      `${attributed} tasi kampaniyadan, ${organic} tasi organik`,
    fullDashboard: "To'liq boshqaruv paneli",
    welcome: (name: string) => `Xush kelibsiz, ${name} 👋`,
    signInCodeLabel: "Kirish kodingiz:",
    signInCodeExpiry: "Davom etish uchun uni Foydami kirish sahifasiga kiriting. 10 daqiqadan so'ng muddati tugaydi.",
    codeGenFailed: "Kodingizni yaratishda xatolik yuz berdi — qaytadan urinib ko'ring.",
    claimExpired: "Bu havolaning muddati o'tgan — orqaga qaytib, qaytadan ulanishga urinib ko'ring.",
    claimLinked: "Bo'ldi! Endi meni kanalingizga administrator qilib qo'shing — men buni avtomatik aniqlayman.",
    channelConnected: (name: string) => `✅ <b>${name}</b> ulandi.`,
    channelConnectedBody:
      "Endi men har bir qo'shilish va chiqishni kuzatib boraman. Keyingi qadam: qo'shilishlarni ularni keltirgan reklamaga bog'lash uchun kampaniya yarating.",
    channelConnectedHint: "24 soatlik hisobot uchun istalgan vaqt /stats, taklif havolalaringiz uchun /links yuboring.",
    createCampaign: "Kampaniya yaratish",
    channelRemoved: (name: string) => `⚠️ Men <b>${name}</b> kanalidan administratorlikdan olib tashlandim.`,
    channelRemovedBody:
      "Kuzatish to'xtadi — bundan buyon qo'shilishlar yozib borilmaydi, va bu bo'shliqni keyin to'ldirib bo'lmaydi.",
    reconnect: "Qayta ulash",
    yourChannel: "Kanalingiz",
  },
  ru: {
    helpIntro: [
      "<b>Foydami</b> покажет, какая реклама приводит подписчиков, которые действительно остаются.",
      "",
      "<b>/stats</b> — как сейчас дела у ваших каналов",
      "<b>/links</b> — ссылки ваших кампаний",
      "<b>/help</b> — это сообщение",
    ].join("\n"),
    openDashboard: "Открыть панель",
    noChannelLinked: "У меня пока нет привязанного к вам канала. Сначала подключите его, и я начну отслеживание.",
    connectChannel: "Подключить канал",
    noChannelsConnected: "Пока нет подключённых каналов.",
    noActiveCampaigns: "Пока нет активных кампаний.",
    yourCampaignLinks: "Ссылки ваших кампаний",
    manageCampaigns: "Управлять кампаниями",
    last24Hours: "Последние 24 часа",
    statsLine: (joined: number, left: number, net: number) =>
      `+${joined} вступили · −${left} ушли · итого ${net >= 0 ? "+" : ""}${net}`,
    attributionLine: (attributed: number, organic: number) => `${attributed} с кампаний, ${organic} органических`,
    fullDashboard: "Полная панель",
    welcome: (name: string) => `Добро пожаловать, ${name} 👋`,
    signInCodeLabel: "Ваш код для входа:",
    signInCodeExpiry: "Введите его на странице входа Foydami, чтобы продолжить. Срок действия — 10 минут.",
    codeGenFailed: "Не удалось создать код — попробуйте ещё раз.",
    claimExpired: "Срок действия этой ссылки истёк — вернитесь и попробуйте подключиться заново.",
    claimLinked: "Готово! Теперь назначьте меня администратором вашего канала — я определю это автоматически.",
    channelConnected: (name: string) => `✅ <b>${name}</b> подключён.`,
    channelConnectedBody:
      "Теперь я отслеживаю каждое вступление и выход. Дальше: создайте кампанию, чтобы вступления можно было проследить до нужной рекламы.",
    channelConnectedHint: "Отправьте /stats в любой момент за сводкой за 24 часа или /links за ссылками.",
    createCampaign: "Создать кампанию",
    channelRemoved: (name: string) => `⚠️ Меня удалили из администраторов канала <b>${name}</b>.`,
    channelRemovedBody:
      "Отслеживание остановлено — новые вступления не будут записываться, и этот пробел нельзя будет восполнить позже.",
    reconnect: "Переподключить",
    yourChannel: "Ваш канал",
  },
} as const;

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
  const s = BOT_STRINGS[resolveLocale(message.from?.language_code)];

  if (command === "/help" || command === "/start") {
    await sendMessage(message.chat.id, s.helpIntro, [{ text: s.openDashboard, url: APP_URL }]);
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
    await sendMessage(message.chat.id, s.noChannelLinked, [
      { text: s.connectChannel, url: `${APP_URL}/onboarding` },
    ]);
    return;
  }

  const { data: channels } = await admin
    .from("channels")
    .select("id, name, bot_status")
    .eq("account_id", claim.account_id);

  if (!channels?.length) {
    await sendMessage(message.chat.id, s.noChannelsConnected, [
      { text: s.connectChannel, url: `${APP_URL}/onboarding` },
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
      : [s.noActiveCampaigns];
    await sendMessage(
      message.chat.id,
      [`<b>${s.yourCampaignLinks}</b>`, "", ...lines].join("\n"),
      [{ text: s.manageCampaigns, url: `${APP_URL}/stats` }],
    );
    return;
  }

  // /stats — last 24h per channel, kept short enough to read on a phone.
  const since = new Date(Date.now() - 86_400_000).toISOString();
  const lines: string[] = [`<b>${s.last24Hours}</b>`, ""];
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
      s.statsLine(joined, left, joined - left),
      s.attributionLine(attributed, joined - attributed),
      "",
    );
  }
  await sendMessage(message.chat.id, lines.join("\n"), [{ text: s.fullDashboard, url: APP_URL }]);
}

// Handles "/start login" DMs — the deep link behind the web app's "Continue
// with Telegram" button. Issues a short pairing code the user types back
// into the web app; the server action there turns it into a real session.
// Unlike the channel-claim handshake below, this has no notion of an
// existing account yet — it's the sign-up/sign-in step itself.
async function handleLoginCommand(admin: any, message: any) {
  const telegramUserId = message.from?.id;
  if (!telegramUserId) return;
  const telegramUsername: string | null = message.from?.username ?? null;
  const s = BOT_STRINGS[resolveLocale(message.from?.language_code)];

  const code = generateLoginCode();
  const { error } = await admin.from("telegram_login_codes").insert({
    code,
    telegram_user_id: telegramUserId,
    telegram_username: telegramUsername,
  });
  if (error) {
    await sendMessage(message.chat.id, s.codeGenFailed);
    return;
  }

  await sendMessage(
    message.chat.id,
    [
      s.welcome(telegramUsername ? "@" + telegramUsername : message.from.first_name),
      "",
      s.signInCodeLabel,
      `<b>${code}</b>`,
      "",
      s.signInCodeExpiry,
    ].join("\n"),
  );
}

// Handles "/start <claim_code>" DMs: links a claim to the Telegram user who
// sent it, so we can later match that same user performing the "add bot as
// admin" action on a channel.
async function handleStartCommand(admin: any, message: any) {
  const text = String(message.text ?? "");
  const parts = text.trim().split(/\s+/);
  if (parts[0] !== "/start" || !parts[1]) return;
  const claimCode = parts[1];
  const s = BOT_STRINGS[resolveLocale(message.from?.language_code)];

  const { data: claim } = await admin
    .from("pending_channel_claims")
    .select("id, expires_at, claimed_channel_id")
    .eq("claim_code", claimCode)
    .maybeSingle();

  if (!claim || claim.claimed_channel_id || new Date(claim.expires_at) < new Date()) {
    await sendMessage(message.chat.id, s.claimExpired);
    return;
  }

  await admin
    .from("pending_channel_claims")
    .update({ telegram_user_id: message.from.id })
    .eq("id", claim.id);

  await sendMessage(message.chat.id, s.claimLinked);
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

// Handles the bot's own membership status changing in a chat: added as
// admin (claim a channel for whoever just linked their Telegram account),
// or removed (mark the channel's bot connection as broken).
async function handleMyChatMember(admin: any, myChatMember: any) {
  const chat = myChatMember.chat;
  if (chat.type !== "channel") return;

  const newStatus = myChatMember.new_chat_member?.status;
  const actorId = myChatMember.from?.id;
  const s = BOT_STRINGS[resolveLocale(myChatMember.from?.language_code)];

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
          s.channelConnected(chat.title ?? s.yourChannel),
          "",
          s.channelConnectedBody,
          "",
          s.channelConnectedHint,
        ].join("\n"),
        [{ text: s.createCampaign, url: `${APP_URL}/stats` }],
      );
    }
    return;
  }

  if (newStatus === "left" || newStatus === "kicked") {
    await admin.from("channels").update({ bot_status: "removed" }).eq("telegram_chat_id", chat.id);
    if (actorId) {
      await sendMessage(
        actorId,
        [s.channelRemoved(chat.title ?? s.yourChannel), "", s.channelRemovedBody].join("\n"),
        [{ text: s.reconnect, url: `${APP_URL}/onboarding` }],
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
        const parts = messageText.split(/\s+/);
        const command = parts[0].split("@")[0].toLowerCase();
        const param = parts[1];

        // "/start login" is the sign-in deep link; "/start <claim_code>" is
        // the channel-claim handshake; everything else (including a bare
        // /start) is a normal bot interaction.
        if (command === "/start" && param === "login") {
          await handleLoginCommand(ctx.supabaseAdmin, update.message);
        } else if (command === "/start" && param) {
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
