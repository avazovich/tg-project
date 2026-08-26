import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  computeRetention,
  countCurrentlyActive,
  computePlacement,
  type MemberEvent,
} from "../src/lib/retention.ts";

const NOW = new Date("2026-08-26T12:00:00Z");
const ago = (days: number) => new Date(NOW.getTime() - days * 86_400_000).toISOString();
const at = (iso: string) => new Date(iso);

const join = (id: number, ts: string): MemberEvent => ({
  telegram_user_id: id,
  event_type: "joined",
  event_timestamp: ts,
});
const leave = (id: number, ts: string): MemberEvent => ({
  telegram_user_id: id,
  event_type: "left",
  event_timestamp: ts,
});

describe("computeRetention", () => {
  test("reports null rather than 0% when no join is old enough to measure", () => {
    // A brand new channel must not look like 0% retention — that would read
    // as catastrophic churn when in fact nothing is knowable yet.
    const events = [join(1, ago(2))];
    const r = computeRetention(events, 30, NOW);
    assert.equal(r.eligible, 0);
    assert.equal(r.pct, null);
  });

  test("counts a member who stayed past the window", () => {
    const r = computeRetention([join(1, ago(10))], 7, NOW);
    assert.deepEqual({ eligible: r.eligible, retained: r.retained, pct: r.pct }, {
      eligible: 1,
      retained: 1,
      pct: 100,
    });
  });

  test("excludes a member who left inside the window", () => {
    const events = [join(1, ago(10)), leave(1, ago(8))]; // left after 2 days
    assert.equal(computeRetention(events, 7, NOW).pct, 0);
  });

  test("a departure AFTER the window still counts as retained for that window", () => {
    // Leaving on day 9 does not retroactively fail the 7-day window.
    const events = [join(1, ago(10)), leave(1, ago(1))];
    assert.equal(computeRetention(events, 7, NOW).pct, 100);
    assert.equal(computeRetention(events, 30, NOW).eligible, 0); // 30d not elapsed
  });

  test("a leave BEFORE the join is ignored", () => {
    // Ordering matters: an earlier departure must not fail a later join.
    const events = [leave(1, ago(20)), join(1, ago(10))];
    assert.equal(computeRetention(events, 7, NOW).pct, 100);
  });

  test("kicked counts as churn, same as leaving", () => {
    const events: MemberEvent[] = [
      join(1, ago(10)),
      { telegram_user_id: 1, event_type: "kicked", event_timestamp: ago(9) },
    ];
    assert.equal(computeRetention(events, 7, NOW).pct, 0);
  });

  test("a rejoin is a fresh acquisition, measured on its own merits", () => {
    // Agreed behaviour: rejoins are new acquisitions, not continuations.
    const events = [join(1, ago(30)), leave(1, ago(29)), join(1, ago(10))];
    const r = computeRetention(events, 7, NOW);
    assert.equal(r.eligible, 2, "both joins are old enough for a 7-day window");
    assert.equal(r.retained, 1, "the first churned, the second held");
    assert.equal(r.pct, 50);
  });

  test("mixes multiple members into one percentage", () => {
    const events = [
      join(1, ago(10)),
      join(2, ago(10)),
      leave(2, ago(9)),
      join(3, ago(10)),
      join(4, ago(2)), // too recent to be eligible
    ];
    const r = computeRetention(events, 7, NOW);
    assert.equal(r.eligible, 3);
    assert.equal(r.retained, 2);
    assert.equal(Math.round(r.pct!), 67);
  });
});

describe("countCurrentlyActive", () => {
  test("counts by each member's most recent event", () => {
    const events = [
      join(1, ago(10)), // still in
      join(2, ago(10)),
      leave(2, ago(5)), // out
      join(3, ago(10)),
      leave(3, ago(5)),
      join(3, ago(1)), // rejoined -> in
    ];
    assert.equal(countCurrentlyActive(events), 2);
  });

  test("empty history is zero, not NaN", () => {
    assert.equal(countCurrentlyActive([]), 0);
  });
});

describe("computePlacement", () => {
  // A "1/24" buy: top slot for 60 minutes, in feed for 24 hours.
  const START = at("2026-08-25T10:00:00Z");
  const TOP_MIN = 60;
  const FEED_HRS = 24;

  const place = (events: MemberEvent[], now = NOW) =>
    computePlacement(events, START, TOP_MIN, FEED_HRS, now);

  test("splits joins across top slot, rest of feed, and after close", () => {
    const events = [
      join(1, "2026-08-25T10:15:00Z"), // top
      join(2, "2026-08-25T10:59:00Z"), // top (just inside)
      join(3, "2026-08-25T11:00:00Z"), // feed (boundary belongs to feed)
      join(4, "2026-08-25T20:00:00Z"), // feed
      join(5, "2026-08-26T11:00:00Z"), // after the 24h window closed
    ];
    const p = place(events);
    assert.equal(p.joinsInTop, 2);
    assert.equal(p.joinsInFeedOnly, 2);
    assert.equal(p.joinsAfter, 1);
    assert.equal(p.joinsInWindow, 4);
    assert.equal(p.topSharePct, 50);
  });

  test("ignores joins that predate the placement entirely", () => {
    // Existing members must never be credited to an ad that ran later.
    const events = [join(1, "2026-08-24T09:00:00Z"), join(2, "2026-08-25T10:30:00Z")];
    const p = place(events);
    assert.equal(p.joinsInTop, 1);
    assert.equal(p.joinsInWindow, 1);
    assert.equal(p.joinsAfter, 0);
  });

  test("counts only window joiners who are still subscribed", () => {
    const events = [
      join(1, "2026-08-25T10:10:00Z"),
      join(2, "2026-08-25T10:20:00Z"),
      leave(2, "2026-08-25T18:00:00Z"), // bought then bounced
      join(3, "2026-08-26T11:30:00Z"), // outside the window; must not count
    ];
    const p = place(events);
    assert.equal(p.joinsInWindow, 2);
    assert.equal(p.retainedFromWindow, 1);
  });

  test("reports null top share when the placement drew nobody", () => {
    const p = place([]);
    assert.equal(p.joinsInWindow, 0);
    assert.equal(p.topSharePct, null);
  });

  test("knows whether the window is still running", () => {
    const during = place([], at("2026-08-25T15:00:00Z"));
    assert.equal(during.windowEnded, false);
    const after = place([], at("2026-08-27T00:00:00Z"));
    assert.equal(after.windowEnded, true);
  });

  test("derives window boundaries from the durations", () => {
    const p = place([]);
    assert.equal(p.window.topEndsAt.toISOString(), "2026-08-25T11:00:00.000Z");
    assert.equal(p.window.feedEndsAt.toISOString(), "2026-08-26T10:00:00.000Z");
  });
});
