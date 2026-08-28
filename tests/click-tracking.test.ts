import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { isLikelyLinkPreviewBot, generateClickSlug } from "../src/lib/click-tracking.ts";

describe("isLikelyLinkPreviewBot", () => {
  test("catches Telegram's own link-preview fetcher", () => {
    // This is the case that actually matters: without it, posting the link
    // in a Telegram message would inflate the click count by one on its own.
    assert.equal(
      isLikelyLinkPreviewBot("TelegramBot (like TwitterBot)"),
      true
    );
  });

  test("catches other major platforms' preview fetchers", () => {
    for (const ua of [
      "facebookexternalhit/1.1",
      "WhatsApp/2.23.20.0",
      "Slackbot-LinkExpanding 1.0",
      "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)",
      "Googlebot/2.1 (+http://www.google.com/bot.html)",
    ]) {
      assert.equal(isLikelyLinkPreviewBot(ua), true, ua);
    }
  });

  test("does not flag a real mobile browser", () => {
    const realUa =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
    assert.equal(isLikelyLinkPreviewBot(realUa), false);
  });

  test("does not flag a real desktop browser", () => {
    const realUa =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
    assert.equal(isLikelyLinkPreviewBot(realUa), false);
  });

  test("treats a missing user agent as unknown, not as a bot", () => {
    // Dropping a click on ambiguous signal is worse than the rare bot that
    // sends no UA at all.
    assert.equal(isLikelyLinkPreviewBot(null), false);
    assert.equal(isLikelyLinkPreviewBot(undefined), false);
    assert.equal(isLikelyLinkPreviewBot(""), false);
  });

  test("is case-insensitive", () => {
    assert.equal(isLikelyLinkPreviewBot("TELEGRAMBOT"), true);
  });
});

describe("generateClickSlug", () => {
  test("produces the requested length", () => {
    assert.equal(generateClickSlug(7).length, 7);
    assert.equal(generateClickSlug(10).length, 10);
  });

  test("avoids visually ambiguous characters", () => {
    // Someone reading this off a printed ad or a screen share may have to
    // type it — 0/O and 1/l/I are the classic transcription errors.
    const sample = Array.from({ length: 200 }, () => generateClickSlug(20)).join("");
    for (const bad of ["0", "O", "1", "l", "I"]) {
      assert.equal(sample.includes(bad), false, `should not contain "${bad}"`);
    }
  });

  test("is URL-safe with no separators", () => {
    const slug = generateClickSlug(7);
    assert.match(slug, /^[A-Za-z0-9]+$/);
  });
});
