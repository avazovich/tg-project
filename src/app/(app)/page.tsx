import { Suspense } from "react";
import { requireOnboardedAccount } from "@/lib/account";
import { loadDashboardData } from "@/lib/dashboard-data";
import { getChatMemberCount } from "@/lib/telegram";
import GrowthChart from "@/components/GrowthChart";
import RetentionDonut from "@/components/RetentionDonut";
import CampaignLinksTable from "@/components/CampaignLinksTable";

export const dynamic = "force-dynamic";

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
    <div className="rounded-[12px] flex items-center gap-4 px-5 py-4" style={{ background: c.bg }}>
      <div
        className="size-12 rounded-full flex items-center justify-center shrink-0"
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
async function LiveMemberCount({ chatId }: { chatId: number }) {
  const memberCount = await getChatMemberCount(chatId);
  return <>{memberCount === null ? "—" : memberCount.toLocaleString()}</>;
}

export default async function DashboardPage() {
  const { activeChannel, user } = await requireOnboardedAccount();
  const data = await loadDashboardData(activeChannel.id);
  const firstName = user.email?.split("@")[0] ?? "there";

  const allTimeJoined = data.campaigns.reduce((sum, c) => sum + c.joined, 0) + data.organicJoined;
  const activeCampaignCount = data.campaigns.filter((c) => c.status === "active").length;

  return (
    <main className="w-full py-[58px] px-[68px]">
      <p className="text-2xl text-[#3629b7]">
        Welcome back <span className="font-semibold">{firstName}</span>
      </p>
      <p className="mt-1 text-sm text-[#8e8f8f]">
        Tracking <span className="text-[#494949] font-medium">{activeChannel.name}</span> —
        which sources produce subscribers who stay, not just subscribers who join.
      </p>

      {data.loadError && (
        <p className="mt-6 text-sm text-red-500">Failed to load data: {data.loadError}</p>
      )}

      <div className="mt-8 rounded-[20px] border border-[#f2eeee] bg-white p-6 shadow-[0_20px_40px_0_rgba(0,0,0,0.03)]">
        <div className="text-base font-medium text-[#494949]">{activeChannel.name}, right now</div>
        <p className="mt-0.5 text-xs text-[#8e8f8f]">
          Live totals from Telegram — includes members from before tracking started.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-[12px] bg-[#f7f4f4] px-4 py-3">
            <div className="text-xs text-[#8e8f8f]">Total members</div>
            <div className="mt-0.5 text-lg font-semibold text-[#11263c]">
              <Suspense fallback={<span className="text-[#c9c9c9]">···</span>}>
                <LiveMemberCount chatId={activeChannel.telegram_chat_id} />
              </Suspense>
            </div>
          </div>
          <div className="rounded-[12px] bg-[#f7f4f4] px-4 py-3">
            <div className="text-xs text-[#8e8f8f]">Tracked joins (all-time)</div>
            <div className="mt-0.5 text-lg font-semibold text-[#11263c]">{allTimeJoined}</div>
          </div>
          <div className="rounded-[12px] bg-[#f7f4f4] px-4 py-3">
            <div className="text-xs text-[#8e8f8f]">Active campaigns</div>
            <div className="mt-0.5 text-lg font-semibold text-[#11263c]">{activeCampaignCount}</div>
          </div>
          <div className="rounded-[12px] bg-[#f7f4f4] px-4 py-3">
            <div className="text-xs text-[#8e8f8f]">Bot status</div>
            <div className="mt-0.5 text-lg font-semibold text-[#11263c] capitalize">
              {activeChannel.bot_status}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Active subscribers" value={String(data.totalActive)} tint="green" icon="dot" />
        <StatCard label="Joined (30d)" value={`+${data.newLast30}`} tint="purple" icon="up" />
        <StatCard label="Left (30d)" value={`-${data.leftLast30}`} tint="orange" icon="down" />
        <StatCard
          label="Net growth (30d)"
          value={`${data.netLast30 >= 0 ? "+" : ""}${data.netLast30}`}
          tint="blue"
          icon="trend"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-[20px] border border-[#f2eeee] bg-white p-6 shadow-[0_20px_40px_0_rgba(0,0,0,0.03)]">
          <div className="text-base font-medium text-[#494949]">Growth — last 30 days</div>
          <div className="mt-2">
            <GrowthChart data={data.dailySeries} />
          </div>
        </div>
        <div className="rounded-[20px] border border-[#f2eeee] bg-white p-6 shadow-[0_20px_40px_0_rgba(0,0,0,0.03)] flex flex-col items-center justify-center">
          <div className="text-base font-medium text-[#494949] self-start">7-day retention</div>
          <div className="mt-4">
            <RetentionDonut pct={data.overallRetention7.pct} />
          </div>
          <div className="mt-3 text-xs text-[#8e8f8f] text-center">
            {data.overallRetention7.eligible > 0
              ? `${data.overallRetention7.retained} of ${data.overallRetention7.eligible} joins retained`
              : "Not enough joins old enough to measure yet"}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[20px] border border-[#f2eeee] bg-white p-6 shadow-[0_20px_40px_0_rgba(0,0,0,0.03)]">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-base font-medium text-[#494949]">Your campaign links</div>
            <p className="mt-0.5 text-xs text-[#8e8f8f]">
              Post these instead of your public channel link — only these can attribute a join.
            </p>
          </div>
          <a href="/stats" className="text-xs text-[#3629b7] hover:underline">
            Full metrics →
          </a>
        </div>
        <CampaignLinksTable campaigns={data.campaigns} />
      </div>

      <p className="mt-6 text-xs text-[#b7b7b7]">
        Working with another channel? Switch which one is active from Profile. Content
        correlation, alerts, and agency views come in later phases, per the build order.
      </p>
    </main>
  );
}
