export type MemberEvent = {
  telegram_user_id: number;
  event_type: "joined" | "left" | "kicked";
  event_timestamp: string;
};

export type RetentionStat = {
  windowDays: number;
  eligible: number; // joins old enough that the window has fully elapsed
  retained: number; // of those, still a member at window end
  pct: number | null; // null when eligible === 0 (not enough data yet)
};

// Per campaign/channel: for every 'joined' event old enough that its N-day
// window has fully elapsed, was the user still a member N days later?
// Events must already be scoped to one campaign (or one channel for rollups).
export function computeRetention(
  events: MemberEvent[],
  windowDays: number,
  now: Date
): RetentionStat {
  const byUser = new Map<number, MemberEvent[]>();
  for (const e of events) {
    const list = byUser.get(e.telegram_user_id) ?? [];
    list.push(e);
    byUser.set(e.telegram_user_id, list);
  }
  for (const list of byUser.values()) {
    list.sort((a, b) => a.event_timestamp.localeCompare(b.event_timestamp));
  }

  let eligible = 0;
  let retained = 0;

  for (const list of byUser.values()) {
    for (const ev of list) {
      if (ev.event_type !== "joined") continue;
      const joinTime = new Date(ev.event_timestamp);
      const windowEnd = new Date(joinTime.getTime() + windowDays * 86_400_000);
      if (windowEnd > now) continue; // window hasn't fully elapsed yet

      eligible++;
      const churnedWithinWindow = list.some(
        (other) =>
          other !== ev &&
          (other.event_type === "left" || other.event_type === "kicked") &&
          new Date(other.event_timestamp) > joinTime &&
          new Date(other.event_timestamp) <= windowEnd
      );
      if (!churnedWithinWindow) retained++;
    }
  }

  return {
    windowDays,
    eligible,
    retained,
    pct: eligible > 0 ? (retained / eligible) * 100 : null,
  };
}

// Currently-active member count: net of joined minus left/kicked, per user
// (a user who left and rejoined counts once, based on their latest event).
export function countCurrentlyActive(events: MemberEvent[]): number {
  const latestByUser = new Map<number, MemberEvent>();
  for (const e of events) {
    const current = latestByUser.get(e.telegram_user_id);
    if (!current || e.event_timestamp > current.event_timestamp) {
      latestByUser.set(e.telegram_user_id, e);
    }
  }
  let active = 0;
  for (const e of latestByUser.values()) {
    if (e.event_type === "joined") active++;
  }
  return active;
}

export type PlacementWindow = {
  /** When the ad post went live. */
  startsAt: Date;
  topEndsAt: Date;
  feedEndsAt: Date;
};

export type PlacementStats = {
  window: PlacementWindow;
  /** Joins while the post was still the channel's newest post. */
  joinsInTop: number;
  /** Joins after the top slot expired but while still in the feed. */
  joinsInFeedOnly: number;
  /** Everything inside the paid window (top + feed). */
  joinsInWindow: number;
  /** Joins that trickled in after the post was removed. */
  joinsAfter: number;
  /** Share of paid-window joins captured during the top slot. */
  topSharePct: number | null;
  /** Of those who joined during the paid window, how many are still here. */
  retainedFromWindow: number;
  windowEnded: boolean;
};

export function computePlacement(
  events: MemberEvent[],
  startsAt: Date,
  topMinutes: number,
  feedHours: number,
  now: Date
): PlacementStats {
  const topEndsAt = new Date(startsAt.getTime() + topMinutes * 60_000);
  const feedEndsAt = new Date(startsAt.getTime() + feedHours * 3_600_000);

  const joins = events.filter((e) => e.event_type === "joined");

  let joinsInTop = 0;
  let joinsInFeedOnly = 0;
  let joinsAfter = 0;
  const windowJoiners = new Set<number>();

  for (const e of joins) {
    const t = new Date(e.event_timestamp);
    if (t < startsAt) continue; // predates this placement entirely
    if (t < topEndsAt) {
      joinsInTop++;
      windowJoiners.add(e.telegram_user_id);
    } else if (t < feedEndsAt) {
      joinsInFeedOnly++;
      windowJoiners.add(e.telegram_user_id);
    } else {
      joinsAfter++;
    }
  }

  // Still a member = their most recent event is a join.
  const latestByUser = new Map<number, MemberEvent>();
  for (const e of events) {
    const cur = latestByUser.get(e.telegram_user_id);
    if (!cur || e.event_timestamp > cur.event_timestamp) latestByUser.set(e.telegram_user_id, e);
  }
  let retainedFromWindow = 0;
  for (const id of windowJoiners) {
    if (latestByUser.get(id)?.event_type === "joined") retainedFromWindow++;
  }

  const joinsInWindow = joinsInTop + joinsInFeedOnly;

  return {
    window: { startsAt, topEndsAt, feedEndsAt },
    joinsInTop,
    joinsInFeedOnly,
    joinsInWindow,
    joinsAfter,
    topSharePct: joinsInWindow > 0 ? (joinsInTop / joinsInWindow) * 100 : null,
    retainedFromWindow,
    windowEnded: now >= feedEndsAt,
  };
}
