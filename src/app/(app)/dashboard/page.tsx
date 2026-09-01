import { requireOnboardedAccount } from "@/lib/account";
import { loadDashboardData } from "@/lib/dashboard-data";
import { isPeriod } from "@/lib/period";
import DashboardBody from "@/components/dashboard/DashboardBody";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { activeChannel, displayName, identityLabel } = await requireOnboardedAccount();
  const { period: periodParam } = await searchParams;
  const period = isPeriod(periodParam) ? periodParam : "7d";
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const data = await loadDashboardData(activeChannel.id, period);
  const firstName =
    displayName ||
    (identityLabel.startsWith("@") ? identityLabel.slice(1) : identityLabel.split("@")[0]) ||
    dict.dashboard.guestFallback;

  return (
    <main className="w-full px-5 py-8 md:px-[68px] md:py-[58px]">
      <p className="text-2xl text-[#3629b7]">
        {dict.dashboard.welcomeBack} <span className="font-semibold">{firstName}</span>
      </p>
      <p className="mt-1 text-sm text-[#8e8f8f]">{dict.dashboard.subtitle}</p>

      <DashboardBody
        channel={activeChannel}
        data={data}
        period={period}
        periodSelectorBasePath="/dashboard"
        statsHref="/stats"
        dict={dict}
        locale={locale}
      />

      <p className="mt-6 text-xs text-[#b7b7b7]">{dict.dashboard.switchChannelNote}</p>
    </main>
  );
}
