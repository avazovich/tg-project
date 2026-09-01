// Deliberately has no "server-only" import and no network code — this is the
// pure, testable half of src/lib/telegram.ts. The rest of that file (the
// functions that actually call the Telegram API using the bot token) does
// carry the server-only guard, and re-exports these two symbols so existing
// imports of "@/lib/telegram" keep working unchanged.

export class TelegramApiError extends Error {
  method: string;
  description: string;

  // Node's native TypeScript stripping only erases types, so constructor
  // parameter properties (which generate real assignment code) aren't usable
  // here if this file is to stay importable from the test suite.
  constructor(method: string, description: string) {
    super(`Telegram ${method} failed: ${description}`);
    this.method = method;
    this.description = description;
  }
}

// English fallback — used when no dictionary is supplied (keeps every
// existing single-argument call site, including the test suite, working).
const EN_TELEGRAM_ERRORS = {
  noInvitePermission:
    'The bot doesn\'t have permission to create invite links for this channel. Open the channel\'s Administrators list, edit the bot\'s rights, and turn on "Invite Users via Link" — then try again.',
  chatNotFound: "This channel isn't reachable anymore — the bot may have been removed. Reconnect it from Settings.",
  rejected: "Telegram rejected this: {description}",
  unknown: "Something went wrong talking to Telegram. Try again in a moment.",
};

export type TelegramErrorDict = typeof EN_TELEGRAM_ERRORS;

/**
 * Turns a Telegram API failure into something a channel owner can act on.
 * "not enough rights" is the one users hit routinely: the bot is a real
 * admin, but whoever promoted it left "Invite Users via Link" unchecked —
 * a permission Telegram's own UI doesn't make obviously required.
 */
export function describeTelegramError(err: unknown, t: TelegramErrorDict = EN_TELEGRAM_ERRORS): string {
  if (err instanceof TelegramApiError) {
    if (/not enough rights/i.test(err.description)) {
      return t.noInvitePermission;
    }
    if (/chat not found/i.test(err.description)) {
      return t.chatNotFound;
    }
    return t.rejected.replace("{description}", err.description);
  }
  return t.unknown;
}
