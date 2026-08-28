import { requireOnboardedAccount } from "@/lib/account";
import { loadDashboardData } from "@/lib/dashboard-data";
import { isPeriod } from "@/lib/period";
import DashboardBody from "@/components/dashboard/DashboardBody";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { activeChannel, user } = await requireOnboardedAccount();
  const { period: periodParam } = await searchParams;
  const period = isPeriod(periodParam) ? periodParam : "7d";

  const data = await loadDashboardData(activeChannel.id, period);
  const firstName = user.email?.split("@")[0] ?? "there";

  return (
    <main className="w-full px-5 py-8 md:px-[68px] md:py-[58px]">
      <p className="text-2xl text-[#3629b7]">
        Welcome back <span className="font-semibold">{firstName}</span>
      </p>
      <p className="mt-1 text-sm text-[#8e8f8f]">
        Which sources produce subscribers who stay, not just subscribers who join.
      </p>

      <DashboardBody
        channel={activeChannel}
        data={data}
        period={period}
        periodSelectorBasePath="/dashboard"
        statsHref="/stats"
      />

      <p className="mt-6 text-xs text-[#b7b7b7]">
        Working with another channel? Switch which one is active from Profile. Content
        correlation, alerts, and agency views come in later phases, per the build order.
      </p>
    </main>
  );
}
