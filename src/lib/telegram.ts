import "server-only";

export { TelegramApiError, describeTelegramError } from "./telegram-errors";
import { TelegramApiError } from "./telegram-errors";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function callTelegram<T>(method: string, params: Record<string, unknown>): Promise<T> {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (!json.ok) {
    throw new TelegramApiError(method, json.description ?? "unknown error");
  }
  return json.result as T;
}

export async function createChatInviteLink(chatId: number, name: string) {
  return callTelegram<{ invite_link: string }>("createChatInviteLink", { chat_id: chatId, name });
}

// Live count from Telegram, independent of our own event history — works
// even for members who joined before the bot was connected.
export async function getChatMemberCount(chatId: number): Promise<number | null> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChatMemberCount`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId }),
      signal: AbortSignal.timeout(5000),
      // Telegram's own count changes slowly; a short cache keeps repeat page
      // loads instant instead of paying the round trip every time.
      next: { revalidate: 60 },
    });
    const json = await res.json();
    if (!json.ok) return null;
    return json.result as number;
  } catch {
    return null;
  }
}

// Whether the bot can actually generate invite links for this channel right
// now. Checked proactively (Settings, onboarding) so the gap surfaces before
// someone hits it mid-campaign-creation.
export async function canInviteUsers(chatId: number): Promise<boolean | null> {
  try {
    const me = await callTelegram<{ id: number }>("getMe", {});
    const member = await callTelegram<{ can_invite_users?: boolean; status: string }>(
      "getChatMember",
      { chat_id: chatId, user_id: me.id }
    );
    if (member.status === "creator") return true; // owners aren't restricted by this flag
    return member.can_invite_users ?? false;
  } catch {
    return null; // unknown — don't claim a problem we couldn't actually check
  }
}
