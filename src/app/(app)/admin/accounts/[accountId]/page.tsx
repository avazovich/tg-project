import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase-admin";
import { loadDashboardData } from "@/lib/dashboard-data";
import { isPeriod } from "@/lib/period";
import DashboardBody from "@/components/dashboard/DashboardBody";

export const dynamic = "force-dynamic";

export default async function AdminAccountPage({
  params,
  searchParams,
}: {
  params: Promise<{ accountId: string }>;
  searchParams: Promise<{ period?: string; channel?: string }>;
}) {
  await requirePlatformAdmin();
  const { accountId } = await params;
  const { period: periodParam, channel: channelParam } = await searchParams;
  const period = isPeriod(periodParam) ? periodParam : "7d";

  const admin = createAdminClient();
  const [{ data: account }, { data: channels }] = await Promise.all([
    admin
      .from("accounts")
      .select("id, display_name, active_channel_id, owner_user_id, telegram_username")
      .eq("id", accountId)
      .single(),
    admin
      .from("channels")
      .select("id, name, telegram_chat_id, bot_status")
      .eq("account_id", accountId)
      .order("created_at", { ascending: true }),
  ]);

  if (!account || !channels || channels.length === 0) notFound();

  // Telegram-only accounts have a synthetic internal email — never surface
  // it; show the Telegram username instead.
  let email: string | null = account.telegram_username ? `@${account.telegram_username}` : null;
  if (!email && account.owner_user_id) {
    const { data } = await admin.auth.admin.getUserById(account.owner_user_id);
    email = data.user?.email ?? null;
  }

  const activeChannel =
    channels.find((c) => c.id === (channelParam ?? account.active_channel_id)) ?? channels[0];

  const data = await loadDashboardData(activeChannel.id, period);
  const extraParams = `&channel=${activeChannel.id}`;

  return (
    <main className="w-full px-5 py-8 md:px-[68px] md:py-[58px]">
      <Link href="/admin" className="text-xs text-[#3629b7] hover:underline">
        ← Admin
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-2xl text-[#3629b7]">
              {account.display_name ?? email ?? "Account"}
            </p>
            <span className="rounded-full bg-[#f4f2ff] px-2 py-0.5 text-[10px] font-medium text-[#3629b7]">
              viewing as admin
            </span>
          </div>
          {email && <p className="mt-0.5 text-sm text-[#8e8f8f]">{email}</p>}
        </div>

        {channels.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {channels.map((ch) => (
              <Link
                key={ch.id}
                href={`/admin/accounts/${accountId}?period=${period}&channel=${ch.id}`}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  ch.id === activeChannel.id
                    ? "bg-[#3629b7] text-white"
                    : "bg-[#f7f4f4] text-[#8e8f8f] hover:text-[#3629b7]"
                }`}
              >
                {ch.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      <DashboardBody
        channel={activeChannel}
        data={data}
        period={period}
        periodSelectorBasePath={`/admin/accounts/${accountId}`}
        periodSelectorExtraParams={extraParams}
      />
    </main>
  );
}
