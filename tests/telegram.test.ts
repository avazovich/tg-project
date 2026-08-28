import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { TelegramApiError, describeTelegramError } from "../src/lib/telegram-errors.ts";

describe("describeTelegramError", () => {
  test("translates a missing invite-link right into an actionable message", () => {
    // This is the exact failure a real user hit: the bot is a genuine admin,
    // but "Invite Users via Link" was left unchecked when it was promoted.
    // Confirmed verbatim against the live Telegram API on 2026-08-28.
    const err = new TelegramApiError(
      "createChatInviteLink",
      "Bad Request: not enough rights to manage chat invite link"
    );
    const msg = describeTelegramError(err);
    assert.match(msg, /Invite Users via Link/);
    assert.match(msg, /Administrators/);
  });

  test("tells the user to reconnect when the channel is gone", () => {
    const err = new TelegramApiError("createChatInviteLink", "Bad Request: chat not found");
    assert.match(describeTelegramError(err), /[Rr]econnect/);
  });

  test("falls back to Telegram's own wording for an unrecognised failure", () => {
    const err = new TelegramApiError("createChatInviteLink", "Bad Request: something unusual");
    assert.match(describeTelegramError(err), /something unusual/);
  });

  test("never lets a network failure surface as a raw exception message", () => {
    // A generic Error (network blip, timeout, JSON parse failure) must still
    // produce human copy — this is the difference between the fix and the
    // original bug, which let exactly this kind of error crash the page.
    const msg = describeTelegramError(new TypeError("fetch failed"));
    assert.doesNotMatch(msg, /TypeError/);
    assert.equal(msg.length > 0, true);
  });
});
