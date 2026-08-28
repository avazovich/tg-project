import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { buildPeriodSeries, isPeriod, type Period } from "../src/lib/period.ts";
import type { MemberEvent } from "../src/lib/retention.ts";

const NOW = new Date("2026-08-28T15:00:00Z"); // mid-afternoon, arbitrary

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

describe("isPeriod", () => {
  test("accepts the four known periods", () => {
    for (const p of ["today", "yesterday", "7d", "30d"]) assert.equal(isPeriod(p), true);
  });
  test("rejects anything else", () => {
    for (const p of [undefined, null, "", "8d", "TODAY", "week"]) assert.equal(isPeriod(p), false);
  });
});

describe("buildPeriodSeries — bucketing", () => {
  test("today is hourly, ends now, spans the prior 24 hours", () => {
    const s = buildPeriodSeries([], "today", NOW);
    assert.equal(s.granularity, "hour");
    assert.equal(s.points.length, 24);
    assert.equal(s.windowEnd.toISOString(), NOW.toISOString());
    assert.equal(s.windowStart.toISOString(), "2026-08-27T15:00:00.000Z");
  });

  test("yesterday is the 24h window immediately before today's", () => {
    const s = buildPeriodSeries([], "yesterday", NOW);
    assert.equal(s.points.length, 24);
    assert.equal(s.windowEnd.toISOString(), "2026-08-27T15:00:00.000Z");
    assert.equal(s.windowStart.toISOString(), "2026-08-26T15:00:00.000Z");
  });

  test("7d and 30d are daily and end now", () => {
    const week = buildPeriodSeries([], "7d", NOW);
    assert.equal(week.granularity, "day");
    assert.equal(week.points.length, 7);

    const month = buildPeriodSeries([], "30d", NOW);
    assert.equal(month.points.length, 30);
  });

  test("an event lands in the correct hour bucket for 'today'", () => {
    // 90 minutes before NOW falls in the 2nd-to-last hourly bucket.
    const s = buildPeriodSeries([join(1, "2026-08-28T13:30:00Z")], "today", NOW);
    const nonEmpty = s.points.filter((p) => p.joined > 0);
    assert.equal(nonEmpty.length, 1);
    assert.equal(nonEmpty[0].bucketStart, "2026-08-28T13:00:00.000Z");
  });

  test("an event exactly on a bucket boundary belongs to the later bucket", () => {
    const s = buildPeriodSeries([join(1, "2026-08-28T13:00:00.000Z")], "today", NOW);
    const hit = s.points.find((p) => p.bucketStart === "2026-08-28T13:00:00.000Z");
    assert.equal(hit?.joined, 1);
  });

  test("an event at the exact window end is excluded (half-open interval)", () => {
    // If included, it would double-count across adjacent periods that share
    // an edge — e.g. the instant "today" starts is also "yesterday" ending.
    const s = buildPeriodSeries([join(1, NOW.toISOString())], "today", NOW);
    assert.equal(s.totalJoined, 0);
  });

  test("events outside the window are ignored entirely", () => {
    const events = [
      join(1, "2026-08-20T00:00:00Z"), // long before the 7d window
      join(2, "2026-08-28T14:59:00Z"), // inside
    ];
    const s = buildPeriodSeries(events, "7d", NOW);
    assert.equal(s.totalJoined, 1);
  });

  test("joins and leaves are counted per bucket and net is derived", () => {
    // Day buckets are rolling from `now` (15:00), not calendar-midnight, so
    // this bucket runs 2026-08-27T15:00 -> 2026-08-28T15:00.
    const events = [
      join(1, "2026-08-27T16:00:00Z"),
      join(2, "2026-08-27T20:00:00Z"),
      leave(3, "2026-08-27T18:00:00Z"),
    ];
    const s = buildPeriodSeries(events, "7d", NOW);
    const day = s.points.find((p) => p.bucketStart === "2026-08-27T15:00:00.000Z");
    assert.equal(day?.joined, 2);
    assert.equal(day?.left, 1);
    assert.equal(day?.net, 1);
  });

  test("totals match the sum of all buckets", () => {
    const events = [
      join(1, "2026-08-26T09:00:00Z"),
      join(2, "2026-08-27T09:00:00Z"),
      leave(2, "2026-08-27T11:00:00Z"),
    ];
    const s = buildPeriodSeries(events, "7d", NOW);
    const sumJoined = s.points.reduce((n, p) => n + p.joined, 0);
    const sumLeft = s.points.reduce((n, p) => n + p.left, 0);
    assert.equal(sumJoined, s.totalJoined);
    assert.equal(sumLeft, s.totalLeft);
    assert.equal(s.totalJoined, 2);
    assert.equal(s.totalLeft, 1);
  });

  test("an empty event list produces a full, zeroed bucket set rather than an empty array", () => {
    // A quiet channel must still render a full week of zero bars, not a
    // collapsed or missing chart.
    const s = buildPeriodSeries([], "7d", NOW);
    assert.equal(s.points.length, 7);
    assert.equal(
      s.points.every((p) => p.joined === 0 && p.left === 0 && p.net === 0),
      true
    );
  });
});

describe("buildPeriodSeries — all four periods stay internally consistent", () => {
  const events: MemberEvent[] = [
    join(1, "2026-08-28T14:00:00Z"), // 1h ago -> today
    join(2, "2026-08-27T14:00:00Z"), // 25h ago -> yesterday
    join(3, "2026-08-25T14:00:00Z"), // 3 days ago -> in 7d, not today/yesterday
    join(4, "2026-08-10T14:00:00Z"), // 18 days ago -> in 30d only
  ];

  for (const period of ["today", "yesterday", "7d", "30d"] as Period[]) {
    test(`${period}: bucket count matches granularity`, () => {
      const s = buildPeriodSeries(events, period, NOW);
      const expected = period === "today" || period === "yesterday" ? 24 : period === "7d" ? 7 : 30;
      assert.equal(s.points.length, expected);
    });
  }

  test("the 3-days-ago join appears in 7d and 30d but not today/yesterday", () => {
    assert.equal(buildPeriodSeries(events, "today", NOW).totalJoined, 1);
    assert.equal(buildPeriodSeries(events, "yesterday", NOW).totalJoined, 1);
    assert.equal(buildPeriodSeries(events, "7d", NOW).totalJoined, 3);
    assert.equal(buildPeriodSeries(events, "30d", NOW).totalJoined, 4);
  });
});
