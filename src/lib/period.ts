import type { MemberEvent } from "./retention";

export const PERIODS = ["today", "yesterday", "7d", "30d"] as const;
export type Period = (typeof PERIODS)[number];

// Display labels live in the i18n dictionary (dict.periods) — this is pure
// data/logic and stays locale-agnostic.

export function isPeriod(v: string | undefined | null): v is Period {
  return !!v && (PERIODS as readonly string[]).includes(v);
}

export type PeriodPoint = {
  /** ISO instant marking the start of this bucket. */
  bucketStart: string;
  joined: number;
  left: number;
  net: number;
};

export type PeriodSeries = {
  granularity: "hour" | "day";
  windowStart: Date;
  windowEnd: Date;
  points: PeriodPoint[];
  totalJoined: number;
  totalLeft: number;
};

const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

/**
 * Buckets events into a fixed rolling window relative to `now`, rather than
 * calendar-day boundaries. A calendar "today" is ambiguous without knowing
 * the viewer's timezone, which a server component doesn't have; a rolling
 * "last 24 hours" needs no timezone at all and is unambiguous for every
 * viewer, which matters more here than matching a wall clock exactly.
 */
export function buildPeriodSeries(
  events: MemberEvent[],
  period: Period,
  now: Date
): PeriodSeries {
  const granularity: PeriodSeries["granularity"] =
    period === "today" || period === "yesterday" ? "hour" : "day";
  const bucketMs = granularity === "hour" ? HOUR_MS : DAY_MS;

  let windowEnd: Date;
  let bucketCount: number;
  if (period === "today") {
    windowEnd = now;
    bucketCount = 24;
  } else if (period === "yesterday") {
    windowEnd = new Date(now.getTime() - DAY_MS);
    bucketCount = 24;
  } else if (period === "7d") {
    windowEnd = now;
    bucketCount = 7;
  } else {
    windowEnd = now;
    bucketCount = 30;
  }
  const windowStart = new Date(windowEnd.getTime() - bucketCount * bucketMs);

  const points: PeriodPoint[] = [];
  for (let i = bucketCount - 1; i >= 0; i--) {
    points.push({
      bucketStart: new Date(windowEnd.getTime() - (i + 1) * bucketMs).toISOString(),
      joined: 0,
      left: 0,
      net: 0,
    });
  }

  let totalJoined = 0;
  let totalLeft = 0;
  for (const e of events) {
    const t = new Date(e.event_timestamp).getTime();
    if (t < windowStart.getTime() || t >= windowEnd.getTime()) continue;
    const idx = Math.floor((t - windowStart.getTime()) / bucketMs);
    if (idx < 0 || idx >= points.length) continue; // guards a t === windowEnd edge case
    if (e.event_type === "joined") {
      points[idx].joined++;
      totalJoined++;
    } else {
      points[idx].left++;
      totalLeft++;
    }
  }
  for (const p of points) p.net = p.joined - p.left;

  return { granularity, windowStart, windowEnd, points, totalJoined, totalLeft };
}
