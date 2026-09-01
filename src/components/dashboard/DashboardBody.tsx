import { Suspense } from "react";
import type { DashboardData } from "@/lib/dashboard-data";
import type { Period } from "@/lib/period";
import { getChatMemberCount } from "@/lib/telegram";
import GrowthChart from "@/components/GrowthChart";
import RetentionDonut from "@/components/RetentionDonut";
import CampaignLinksTable from "@/components/CampaignLinksTable";
import PeriodSelector from "@/components/PeriodSelector";
import type { Dictionary } from "@/i18n/dictionary";
import { INTL_LOCALE, type Locale } from "@/i18n/config";
import { t } from "@/i18n/interpolate";

const TINTS = {
  green: { bg: "#edffef", fg: "#55a55e", ring: "#c7f2cb" },
  purple: { bg: "#f4f2ff", fg: "#5e5498", ring: "#dcd6ff" },
  orange: { bg: "#fff2ec", fg: "#9b715d", ring: "#ffd9c4" },
  blue: { bg: "#eaf3ff", fg: "#1d5fa8", ring: "#bfe0ff" },
} as const;

function StatIcon({ kind, color }: { kind: "up" | "down" | "dot" | "trend"; color: string }) {
  if (kind === "up") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M4 12l5-5 3 3 4-4" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 6h4v4" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "down") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M4 6l5 5 3-3 4 4" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 12h4V8" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "trend") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 14l4-4 3 3 5-7" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return <div className="size-2.5 rounded-full" style={{ background: color }} />;
}

function StatCard({
  label,
  value,
  tint,
  icon,
}: {
  label: string;
  value: string;
  tint: keyof typeof TINTS;
  icon: "up" | "down" | "dot" | "trend";
}) {
  const c = TINTS[tint];
  return (
    <div
      className="flex items-center gap-4 rounded-[12px] px-5 py-4 transition-transform duration-150 ease-out hover:-translate-y-0.5"
      style={{ background: c.bg }}
    >
      <div
        className="flex size-12 shrink-0 items-center justify-center rounded-full"
        style={{ background: c.ring }}
      >
        <StatIcon kind={icon} color={c.fg} />
      </div>
      <div>
        <div className="text-[13px]" style={{ color: c.fg }}>
          {label}
        </div>
        <div className="mt-0.5 text-[18px] font-semibold text-[#11263c]">{value}</div>
      </div>
    </div>
  );
}

// Streamed separately so a slow Telegram API call never blocks the rest of
// the page from painting.
async function LiveMemberCount({ chatId, intlLocale }: { chatId: number; intlLocale: string }) {
  const memberCount = await getChatMemberCount(chatId);
  return <>{memberCount === null ? "—" : memberCount.toLocaleString(intlLocale)}</>;
}

type Channel = {
  id: string;
  name: string;
  telegram_chat_id: number;
  bot_status: string;
};

/**
 * The dashboard's content, independent of who is looking at it or through
 * which route. Used by both the real Dashboard and the admin per-account
 * view, so "the exact same graphs and numbers" is true by construction
 * rather than by two implementations staying in sync by hand.
 */
export default function DashboardBody({
  channel,
  data,
  period,
  periodSelectorBasePath,
  periodSelectorExtraParams,
  statsHref,
  dict,
  locale,
}: {
  channel: Channel;
  data: DashboardData;
  period: Period;
  periodSelectorBasePath: string;
  periodSelectorExtraParams?: string;
  statsHref?: string;
  dict: Dictionary;
  locale: Locale;
}) {
  const d = dict.dashboardBody;
  const allTimeJoined = data.campaigns.reduce((sum, c) => sum + c.joined, 0) + data.organicJoined;
  const activeCampaignCount = data.campaigns.filter((c) => c.status === "active").length;
  const periodLabel = dict.periods[period];

  return (
    <>
      {data.loadError && (
        <p className="mt-6 text-sm text-red-500">{t(d.failedToLoad, { error: data.loadError })}</p>
      )}

      <div className="mt-8 rounded-[20px] border border-[#f2eeee] bg-white p-5 shadow-[0_20px_40px_0_rgba(0,0,0,0.03)] md:p-6">
        <div className="text-base font-medium text-[#494949]">
          {t(d.rightNow, { channel: channel.name })}
        </div>
        <p className="mt-0.5 text-xs text-[#8e8f8f]">{d.liveTotalsNote}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-[12px] bg-[#f7f4f4] px-4 py-3">
            <div className="text-xs text-[#8e8f8f]">{d.totalMembers}</div>
            <div className="mt-0.5 text-lg font-semibold text-[#11263c]">
              <Suspense fallback={<span className="text-[#c9c9c9]">···</span>}>
                <LiveMemberCount chatId={channel.telegram_chat_id} intlLocale={INTL_LOCALE[locale]} />
              </Suspense>
            </div>
          </div>
          <div className="rounded-[12px] bg-[#f7f4f4] px-4 py-3">
            <div className="text-xs text-[#8e8f8f]">{d.trackedJoinsAllTime}</div>
            <div className="mt-0.5 text-lg font-semibold text-[#11263c]">{allTimeJoined}</div>
          </div>
          <div className="rounded-[12px] bg-[#f7f4f4] px-4 py-3">
            <div className="text-xs text-[#8e8f8f]">{d.activeCampaigns}</div>
            <div className="mt-0.5 text-lg font-semibold text-[#11263c]">{activeCampaignCount}</div>
          </div>
          <div className="rounded-[12px] bg-[#f7f4f4] px-4 py-3">
            <div className="text-xs text-[#8e8f8f]">{d.botStatus}</div>
            <div className="mt-0.5 text-lg font-semibold text-[#11263c] capitalize">
              {dict.settings.botStatusLabel[channel.bot_status as keyof typeof dict.settings.botStatusLabel] ??
                channel.bot_status}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-[#8e8f8f]">{t(d.showing, { period: periodLabel })}</div>
        <PeriodSelector
          active={period}
          basePath={periodSelectorBasePath}
          extraParams={periodSelectorExtraParams}
          labels={dict.periods}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={d.activeSubscribers} value={String(data.totalActive)} tint="green" icon="dot" />
        <StatCard
          label={t(d.joinedPeriod, { period: periodLabel })}
          value={`+${data.periodJoined}`}
          tint="purple"
          icon="up"
        />
        <StatCard
          label={t(d.leftPeriod, { period: periodLabel })}
          value={`-${data.periodLeft}`}
          tint="orange"
          icon="down"
        />
        <StatCard
          label={t(d.netGrowthPeriod, { period: periodLabel })}
          value={`${data.periodNet >= 0 ? "+" : ""}${data.periodNet}`}
          tint="blue"
          icon="trend"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="rounded-[20px] border border-[#f2eeee] bg-white p-5 shadow-[0_20px_40px_0_rgba(0,0,0,0.03)] md:p-6 xl:col-span-2">
          <div className="text-base font-medium text-[#494949]">{t(d.growth, { period: periodLabel })}</div>
          <div className="mt-2">
            <GrowthChart
              data={data.series}
              granularity={data.periodGranularity}
              intlLocale={INTL_LOCALE[locale]}
            />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center rounded-[20px] border border-[#f2eeee] bg-white p-5 shadow-[0_20px_40px_0_rgba(0,0,0,0.03)] md:p-6">
          <div className="self-start text-base font-medium text-[#494949]">{d.sevenDayRetention}</div>
          <div className="mt-4">
            <RetentionDonut pct={data.overallRetention7.pct} />
          </div>
          <div className="mt-3 text-center text-xs text-[#8e8f8f]">
            {data.overallRetention7.eligible > 0
              ? t(d.joinsRetained, {
                  retained: data.overallRetention7.retained,
                  eligible: data.overallRetention7.eligible,
                })
              : d.notEnoughJoins}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[20px] border border-[#f2eeee] bg-white p-5 shadow-[0_20px_40px_0_rgba(0,0,0,0.03)] md:p-6">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-base font-medium text-[#494949]">{d.campaignLinks}</div>
            <p className="mt-0.5 text-xs text-[#8e8f8f]">{d.campaignLinksNote}</p>
          </div>
          {statsHref && (
            <a
              href={statsHref}
              className="text-xs text-[#3629b7] transition-colors hover:text-[#2d2296] hover:underline"
            >
              {d.fullMetrics}
            </a>
          )}
        </div>
        <CampaignLinksTable
          campaigns={data.campaigns}
          t={dict.campaignLinksTable}
          statusText={dict.common.campaignStatus}
          copyText={dict.copyLinkButton}
        />
      </div>
    </>
  );
}
