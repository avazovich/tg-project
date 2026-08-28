import "server-only";
import { createAdminClient } from "./supabase-admin";
import {
  computeRetention,
  countCurrentlyActive,
  computePlacement,
  type MemberEvent,
  type PlacementStats,
} from "./retention";
import { buildPeriodSeries, type Period, type PeriodPoint } from "./period";

export type QualityBand = "high" | "medium" | "low" | "unknown";

type Retention = ReturnType<typeof computeRetention>;

export type CampaignRow = {
  id: string;
  name: string;
  channelName: string | null;
  sourceCategory: string;
  status: string;
  budget: number | null;
  inviteLinkUrl: string | null;
  promoStartsAt: string | null;
  topMinutes: number | null;
  feedHours: number | null;
  placement: PlacementStats | null;
  joined: number;
  active: number;
  churned: number;
  churnRate: number | null; // share of joins that have since left
  retention1: Retention;
  retention7: Retention;
  retention30: Retention;
  retention90: Retention;
  quality: QualityBand;
  cac: number | null; // spend per subscriber acquired
  costPerRetained: number | null; // spend per subscriber still here
};

export type { PeriodPoint };

export type DashboardData = {
  totalActive: number;
  period: Period;
  periodGranularity: "hour" | "day";
  periodJoined: number;
  periodLeft: number;
  periodNet: number;
  series: PeriodPoint[];
  overallRetention7: Retention;
  campaigns: CampaignRow[];
  organicJoined: number;
  // Blended across every campaign that has a budget set.
  totalSpend: number;
  paidJoined: number;
  paidActive: number;
  blendedCac: number | null;
  blendedCostPerRetained: number | null;
  loadError: string | null;
};

function qualityBand(pct: number | null): QualityBand {
  if (pct === null) return "unknown";
  if (pct >= 70) return "high";
  if (pct >= 40) return "medium";
  return "low";
}

export async function loadDashboardData(
  channelId: string,
  period: Period = "7d"
): Promise<DashboardData> {
  const supabase = createAdminClient();
  const now = new Date();

  const [{ data: campaigns, error: campaignsError }, { data: events, error: eventsError }] =
    await Promise.all([
      supabase
        .from("campaigns")
        .select(
          "id, name, source_category, status, budget, invite_link_url, promo_starts_at, top_minutes, feed_hours, channels(name)"
        )
        .eq("channel_id", channelId)
        .order("created_at", { ascending: false }),
      supabase
        .from("member_events")
        .select("campaign_id, telegram_user_id, event_type, event_timestamp")
        .eq("channel_id", channelId),
    ]);

  const loadError = campaignsError?.message ?? eventsError?.message ?? null;
  const allEvents: MemberEvent[] = (events ?? []).map((e) => ({
    telegram_user_id: e.telegram_user_id,
    event_type: e.event_type as MemberEvent["event_type"],
    event_timestamp: e.event_timestamp,
  }));

  const totalActive = countCurrentlyActive(allEvents);
  const overallRetention7 = computeRetention(allEvents, 7, now);

  const periodSeries = buildPeriodSeries(allEvents, period, now);

  const eventsByCampaign = new Map<string, MemberEvent[]>();
  let organicJoined = 0;
  for (const e of events ?? []) {
    if (!e.campaign_id) {
      if (e.event_type === "joined") organicJoined++;
      continue;
    }
    const list = eventsByCampaign.get(e.campaign_id) ?? [];
    list.push({
      telegram_user_id: e.telegram_user_id,
      event_type: e.event_type as MemberEvent["event_type"],
      event_timestamp: e.event_timestamp,
    });
    eventsByCampaign.set(e.campaign_id, list);
  }

  const campaignRows: CampaignRow[] = (campaigns ?? []).map((c) => {
    const campaignEvents = eventsByCampaign.get(c.id) ?? [];
    const joined = campaignEvents.filter((e) => e.event_type === "joined").length;
    const active = countCurrentlyActive(campaignEvents);
    const churned = Math.max(joined - active, 0);
    const retention1 = computeRetention(campaignEvents, 1, now);
    const retention7 = computeRetention(campaignEvents, 7, now);
    const retention30 = computeRetention(campaignEvents, 30, now);
    const retention90 = computeRetention(campaignEvents, 90, now);
    // Prefer the longest window that has enough elapsed data to be meaningful.
    const qualityPct =
      retention30.pct ?? retention7.pct ?? retention1.pct;
    const channelName = Array.isArray(c.channels)
      ? c.channels[0]?.name ?? null
      : (c.channels as { name: string } | null)?.name ?? null;

    return {
      id: c.id,
      name: c.name,
      channelName,
      sourceCategory: c.source_category,
      status: c.status,
      budget: c.budget,
      inviteLinkUrl: c.invite_link_url,
      promoStartsAt: c.promo_starts_at,
      topMinutes: c.top_minutes,
      feedHours: c.feed_hours,
      placement:
        c.promo_starts_at && c.top_minutes && c.feed_hours
          ? computePlacement(
              campaignEvents,
              new Date(c.promo_starts_at),
              c.top_minutes,
              c.feed_hours,
              now
            )
          : null,
      joined,
      active,
      churned,
      churnRate: joined > 0 ? (churned / joined) * 100 : null,
      retention1,
      retention7,
      retention30,
      retention90,
      quality: qualityBand(qualityPct),
      cac: c.budget && joined > 0 ? c.budget / joined : null,
      costPerRetained: c.budget && active > 0 ? c.budget / active : null,
    };
  });

  const budgeted = campaignRows.filter((c) => c.budget && c.budget > 0);
  const totalSpend = budgeted.reduce((sum, c) => sum + (c.budget ?? 0), 0);
  const paidJoined = budgeted.reduce((sum, c) => sum + c.joined, 0);
  const paidActive = budgeted.reduce((sum, c) => sum + c.active, 0);

  return {
    totalActive,
    period,
    periodGranularity: periodSeries.granularity,
    periodJoined: periodSeries.totalJoined,
    periodLeft: periodSeries.totalLeft,
    periodNet: periodSeries.totalJoined - periodSeries.totalLeft,
    series: periodSeries.points,
    overallRetention7,
    campaigns: campaignRows,
    organicJoined,
    totalSpend,
    paidJoined,
    paidActive,
    blendedCac: paidJoined > 0 ? totalSpend / paidJoined : null,
    blendedCostPerRetained: paidActive > 0 ? totalSpend / paidActive : null,
    loadError,
  };
}
