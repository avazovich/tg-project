import "server-only";
import { createAdminClient } from "./supabase-admin";
import { computeRetention, countCurrentlyActive, type MemberEvent } from "./retention";

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

export type DailyPoint = {
  date: string; // YYYY-MM-DD
  joined: number;
  left: number;
  net: number;
};

export type DashboardData = {
  totalActive: number;
  newLast30: number;
  leftLast30: number;
  netLast30: number;
  overallRetention7: Retention;
  dailySeries: DailyPoint[];
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

export async function loadDashboardData(channelId: string): Promise<DashboardData> {
  const supabase = createAdminClient();
  const now = new Date();

  const [{ data: campaigns, error: campaignsError }, { data: events, error: eventsError }] =
    await Promise.all([
      supabase
        .from("campaigns")
        .select("id, name, source_category, status, budget, invite_link_url, channels(name)")
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

  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86_400_000);
  const last30 = (events ?? []).filter((e) => new Date(e.event_timestamp) >= thirtyDaysAgo);
  const newLast30 = last30.filter((e) => e.event_type === "joined").length;
  const leftLast30 = last30.filter((e) => e.event_type !== "joined").length;

  const dailyMap = new Map<string, DailyPoint>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86_400_000);
    const key = d.toISOString().slice(0, 10);
    dailyMap.set(key, { date: key, joined: 0, left: 0, net: 0 });
  }
  for (const e of last30) {
    const key = e.event_timestamp.slice(0, 10);
    const point = dailyMap.get(key);
    if (!point) continue;
    if (e.event_type === "joined") point.joined++;
    else point.left++;
  }
  for (const point of dailyMap.values()) point.net = point.joined - point.left;
  const dailySeries = Array.from(dailyMap.values());

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
    newLast30,
    leftLast30,
    netLast30: newLast30 - leftLast30,
    overallRetention7,
    dailySeries,
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
