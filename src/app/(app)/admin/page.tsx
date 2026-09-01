import Link from "next/link";
import { requirePlatformAdmin, loadAdminData, type AdminAccountRow } from "@/lib/admin";
import SignupsChart from "@/components/SignupsChart";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";
import { INTL_LOCALE } from "@/i18n/config";
import { t as interpolate } from "@/i18n/interpolate";
import type { Dictionary } from "@/i18n/dictionary";

export const dynamic = "force-dynamic";

const STAGE_CLASS: Record<AdminAccountRow["stage"], string> = {
  signed_up: "bg-[#f2eeee] text-[#8e8f8f]",
  connected: "bg-[#eaf3ff] text-[#1d5fa8]",
  campaigning: "bg-[#f4f2ff] text-[#5e5498]",
  attributing: "bg-[#edffef] text-[#55a55e]",
};

function Tile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-[12px] bg-[#f7f4f4] px-4 py-3">
      <div className="text-xs text-[#8e8f8f]">{label}</div>
      <div className="mt-0.5 text-lg font-semibold text-[#11263c]">{value}</div>
      {hint && <div className="mt-0.5 text-[11px] text-[#b7b7b7]">{hint}</div>}
    </div>
  );
}

function relative(iso: string | null, t: Dictionary["admin"]["relativeTime"]) {
  if (!iso) return t.never;
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t.justNow;
  if (mins < 60) return interpolate(t.minutesAgo, { n: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return interpolate(t.hoursAgo, { n: hours });
  const days = Math.floor(hours / 24);
  return interpolate(t.daysAgo, { n: days });
}

function FunnelBar({
  label,
  count,
  total,
}: {
  label: string;
  count: number;
  total: number;
}) {
  const share = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-[#494949]">{label}</span>
        <span className="text-[#11263c] font-medium">
          {count}
          <span className="ml-1.5 text-xs font-normal text-[#8e8f8f]">
            {total > 0 ? `${share.toFixed(0)}%` : "—"}
          </span>
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#f2eeee]">
        <div className="h-full rounded-full bg-[#3629b7]" style={{ width: `${share}%` }} />
      </div>
    </div>
  );
}

export default async function AdminPage() {
  await requirePlatformAdmin();
  const data = await loadAdminData();
  const { funnel, totals } = data;
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const a = dict.admin;
  const STAGE_LABEL = a.stage;

  return (
    <main className="w-full px-5 py-8 md:px-[68px] md:py-[58px]">
      <h1 className="text-2xl font-semibold text-[#3629b7]">{a.title}</h1>
      <p className="mt-1 text-sm text-[#8e8f8f]">{a.subtitle}</p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile
          label={a.tiles.accounts}
          value={String(totals.accounts)}
          hint={interpolate(a.tiles.accountsHint, { count: data.signupsLast7 })}
        />
        <Tile label={a.tiles.active7d} value={String(data.activeLast7)} hint={a.tiles.active7dHint} />
        <Tile label={a.tiles.channelsTracked} value={String(totals.channels)} />
        <Tile
          label={a.tiles.eventsIngested}
          value={totals.eventsIngested.toLocaleString(INTL_LOCALE[locale])}
          hint={a.tiles.eventsIngestedHint}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="rounded-[20px] border border-[#f2eeee] bg-white p-5 shadow-[0_20px_40px_0_rgba(0,0,0,0.03)] md:p-6">
          <div className="text-base font-medium text-[#494949]">{a.funnel.title}</div>
          <p className="mt-0.5 text-xs text-[#8e8f8f]">{a.funnel.subtitle}</p>
          <div className="mt-5 flex flex-col gap-4">
            <FunnelBar label={a.funnel.signedUp} count={funnel.signedUp} total={funnel.signedUp} />
            <FunnelBar
              label={a.funnel.connectedChannel}
              count={funnel.connectedChannel}
              total={funnel.signedUp}
            />
            <FunnelBar
              label={a.funnel.createdCampaign}
              count={funnel.createdCampaign}
              total={funnel.signedUp}
            />
            <FunnelBar
              label={a.funnel.gotAttributedJoin}
              count={funnel.gotAttributedJoin}
              total={funnel.signedUp}
            />
          </div>
          <p className="mt-4 text-[11px] text-[#b7b7b7]">{a.funnel.footnote}</p>
        </div>

        <div className="rounded-[20px] border border-[#f2eeee] bg-white p-5 shadow-[0_20px_40px_0_rgba(0,0,0,0.03)] md:p-6">
          <div className="text-base font-medium text-[#494949]">{a.signups30d}</div>
          <div className="mt-2">
            <SignupsChart data={data.signupSeries} />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[20px] border border-[#f2eeee] bg-white p-5 shadow-[0_20px_40px_0_rgba(0,0,0,0.03)] md:p-6">
        <div className="text-base font-medium text-[#494949]">{a.accountsTable.title}</div>
        <p className="mt-0.5 text-xs text-[#8e8f8f]">{a.accountsTable.subtitle}</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#f2eeee] text-left text-xs text-[#8e8f8f]">
                <th className="py-2 pr-4 font-normal">{a.accountsTable.account}</th>
                <th className="py-2 pr-4 font-normal">{a.accountsTable.signedUp}</th>
                <th className="py-2 pr-4 font-normal">{a.accountsTable.lastSeen}</th>
                <th className="py-2 pr-4 font-normal">{a.accountsTable.channels}</th>
                <th className="py-2 pr-4 font-normal">{a.accountsTable.campaigns}</th>
                <th className="py-2 pr-4 font-normal">{a.accountsTable.joins}</th>
                <th className="py-2 pr-4 font-normal">{a.accountsTable.attributed}</th>
                <th className="py-2 pr-4 font-normal">{a.accountsTable.lastEvent}</th>
                <th className="py-2 pr-4 font-normal">{a.accountsTable.stage}</th>
              </tr>
            </thead>
            <tbody>
              {data.accounts.map((row) => {
                const clickable = row.channelCount > 0;
                const identity = row.telegramUsername ? `@${row.telegramUsername}` : row.email;
                const nameBlock = (
                  <>
                    <div className="font-medium text-[#11263c]">
                      {row.displayName ?? identity ?? dict.common.dash}
                      {row.isPlatformAdmin && (
                        <span className="ml-2 rounded-full bg-[#f4f2ff] px-2 py-0.5 text-[10px] font-medium text-[#3629b7]">
                          {a.accountsTable.adminBadge}
                        </span>
                      )}
                    </div>
                    {row.displayName && identity && (
                      <div className="text-xs text-[#8e8f8f]">{identity}</div>
                    )}
                  </>
                );
                return (
                <tr
                  key={row.accountId}
                  className={`border-b border-[#f7f4f4] ${clickable ? "transition-colors hover:bg-[#faf9ff]" : ""}`}
                >
                  <td className="py-3 pr-4">
                    {clickable ? (
                      <Link href={`/admin/accounts/${row.accountId}`} className="block">
                        {nameBlock}
                      </Link>
                    ) : (
                      nameBlock
                    )}
                  </td>
                  <td className="whitespace-nowrap py-3 pr-4 text-[#8e8f8f]">
                    {new Date(row.signedUpAt).toLocaleDateString(INTL_LOCALE[locale])}
                  </td>
                  <td className="whitespace-nowrap py-3 pr-4 text-[#8e8f8f]">
                    {relative(row.lastSignInAt, a.relativeTime)}
                  </td>
                  <td className="py-3 pr-4 text-[#494949]">
                    {row.channelCount}
                    {row.brokenChannelCount > 0 && (
                      <span className="ml-1 text-xs text-[#ff4267]">
                        {interpolate(a.accountsTable.broken, { count: row.brokenChannelCount })}
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-[#494949]">{row.campaignCount}</td>
                  <td className="py-3 pr-4 text-[#494949]">{row.joinsTracked}</td>
                  <td className="py-3 pr-4 text-[#494949]">{row.attributedJoins}</td>
                  <td className="whitespace-nowrap py-3 pr-4 text-[#8e8f8f]">
                    {relative(row.lastEventAt, a.relativeTime)}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${STAGE_CLASS[row.stage]}`}
                    >
                      {STAGE_LABEL[row.stage]}
                    </span>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
          {data.accounts.length === 0 && (
            <p className="mt-4 text-sm text-[#8e8f8f]">{a.accountsTable.noAccountsYet}</p>
          )}
        </div>
      </div>
    </main>
  );
}
