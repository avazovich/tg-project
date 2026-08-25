import "server-only";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function createChatInviteLink(chatId: number, name: string) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/createChatInviteLink`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, name }),
  });
  const json = await res.json();
  if (!json.ok) {
    throw new Error(`Telegram createChatInviteLink failed: ${JSON.stringify(json)}`);
  }
  return json.result as { invite_link: string };
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
