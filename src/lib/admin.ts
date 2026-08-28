import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getCurrentUser } from "./account";
import { createAdminClient } from "./supabase-admin";

export type AdminAccountRow = {
  accountId: string;
  email: string | null;
  displayName: string | null;
  signedUpAt: string;
  lastSignInAt: string | null;
  channelCount: number;
  brokenChannelCount: number;
  campaignCount: number;
  joinsTracked: number;
  attributedJoins: number;
  lastEventAt: string | null;
  isPlatformAdmin: boolean;
  /** How far this account got through setup. */
  stage: "signed_up" | "connected" | "campaigning" | "attributing";
};

export type AdminData = {
  totals: {
    accounts: number;
    channels: number;
    campaigns: number;
    eventsIngested: number;
  };
  funnel: {
    signedUp: number;
    connectedChannel: number;
    createdCampaign: number;
    gotAttributedJoin: number;
  };
  signupsLast7: number;
  signupsLast30: number;
  activeLast7: number;
  signupSeries: { date: string; count: number }[];
  accounts: AdminAccountRow[];
};

// Returns the caller's account only if they are a platform admin.
// notFound() rather than a redirect, so the page's existence isn't advertised
// to signed-in non-admins.
export const requirePlatformAdmin = cache(async () => {
  const user = await getCurrentUser();
  if (!user) notFound();

  const admin = createAdminClient();
  const { data } = await admin
    .from("accounts")
    .select("id, is_platform_admin")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (!data?.is_platform_admin) notFound();
  return { user, accountId: data.id as string };
});

function stageOf(row: {
  channel_count: number;
  campaign_count: number;
  attributed_joins: number;
}): AdminAccountRow["stage"] {
  if (row.attributed_joins > 0) return "attributing";
  if (row.campaign_count > 0) return "campaigning";
  if (row.channel_count > 0) return "connected";
  return "signed_up";
}

export async function loadAdminData(): Promise<AdminData> {
  const admin = createAdminClient();
  const now = new Date();

  const [{ data: overview }, { count: eventsIngested }, authUsers] = await Promise.all([
    admin.from("admin_account_overview").select("*").order("created_at", { ascending: false }),
    admin.from("member_events").select("*", { count: "exact", head: true }),
    // Emails and sign-in times live in auth.users, not our own tables.
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  // TEMP DIAGNOSTIC (2026-08-28): the deployed admin page is showing "—" /
  // "never" for every account despite the underlying data being correct —
  // narrowing down whether auth.admin.listUsers() is actually succeeding in
  // this environment. Logs server-side only; no secret or user PII beyond
  // counts. Remove once diagnosed.
  console.error("[admin-diag] listUsers error:", authUsers.error?.message ?? null);
  console.error("[admin-diag] listUsers count:", authUsers.data?.users?.length ?? "n/a");
  console.error(
    "[admin-diag] listUsers sample ids:",
    (authUsers.data?.users ?? []).slice(0, 3).map((u) => u.id)
  );
  console.error(
    "[admin-diag] overview owner_user_ids:",
    (overview ?? []).map((r) => r.owner_user_id)
  );

  const usersById = new Map(
    (authUsers.data?.users ?? []).map((u) => [u.id, u])
  );

  const rows = overview ?? [];
  const accounts: AdminAccountRow[] = rows.map((r) => {
    const authUser = r.owner_user_id ? usersById.get(r.owner_user_id) : undefined;
    return {
      accountId: r.account_id,
      email: authUser?.email ?? null,
      displayName: r.display_name,
      signedUpAt: r.created_at,
      lastSignInAt: authUser?.last_sign_in_at ?? null,
      channelCount: r.channel_count,
      brokenChannelCount: r.broken_channel_count,
      campaignCount: r.campaign_count,
      joinsTracked: r.joins_tracked,
      attributedJoins: r.attributed_joins,
      lastEventAt: r.last_event_at,
      isPlatformAdmin: r.is_platform_admin,
      stage: stageOf(r),
    };
  });

  const since = (days: number) => new Date(now.getTime() - days * 86_400_000);
  const d7 = since(7);
  const d30 = since(30);

  const signupSeries: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const key = new Date(now.getTime() - i * 86_400_000).toISOString().slice(0, 10);
    signupSeries.push({ date: key, count: 0 });
  }
  const seriesIndex = new Map(signupSeries.map((p, i) => [p.date, i]));
  for (const a of accounts) {
    const idx = seriesIndex.get(a.signedUpAt.slice(0, 10));
    if (idx !== undefined) signupSeries[idx].count++;
  }

  return {
    totals: {
      accounts: accounts.length,
      channels: accounts.reduce((s, a) => s + a.channelCount, 0),
      campaigns: accounts.reduce((s, a) => s + a.campaignCount, 0),
      eventsIngested: eventsIngested ?? 0,
    },
    funnel: {
      signedUp: accounts.length,
      connectedChannel: accounts.filter((a) => a.channelCount > 0).length,
      createdCampaign: accounts.filter((a) => a.campaignCount > 0).length,
      gotAttributedJoin: accounts.filter((a) => a.attributedJoins > 0).length,
    },
    signupsLast7: accounts.filter((a) => new Date(a.signedUpAt) >= d7).length,
    signupsLast30: accounts.filter((a) => new Date(a.signedUpAt) >= d30).length,
    activeLast7: accounts.filter(
      (a) => a.lastSignInAt && new Date(a.lastSignInAt) >= d7
    ).length,
    signupSeries,
    accounts,
  };
}
