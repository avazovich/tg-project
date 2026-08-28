import Link from "next/link";
import { requirePlatformAdmin, loadAdminData, type AdminAccountRow } from "@/lib/admin";
import SignupsChart from "@/components/SignupsChart";

export const dynamic = "force-dynamic";

const STAGE_LABEL: Record<AdminAccountRow["stage"], string> = {
  signed_up: "Signed up",
  connected: "Connected channel",
  campaigning: "Running campaigns",
  attributing: "Getting attributed joins",
};

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

function relative(iso: string | null) {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
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

  return (
    <main className="w-full px-5 py-8 md:px-[68px] md:py-[58px]">
      <h1 className="text-2xl font-semibold text-[#3629b7]">Admin</h1>
      <p className="mt-1 text-sm text-[#8e8f8f]">
        Platform-wide usage across every account on Foydami.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label="Accounts" value={String(totals.accounts)} hint={`+${data.signupsLast7} in 7d`} />
        <Tile
          label="Active (7d)"
          value={String(data.activeLast7)}
          hint="signed in recently"
        />
        <Tile label="Channels tracked" value={String(totals.channels)} />
        <Tile
          label="Events ingested"
          value={totals.eventsIngested.toLocaleString()}
          hint="joins + leaves, all time"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="rounded-[20px] border border-[#f2eeee] bg-white p-5 shadow-[0_20px_40px_0_rgba(0,0,0,0.03)] md:p-6">
          <div className="text-base font-medium text-[#494949]">Activation funnel</div>
          <p className="mt-0.5 text-xs text-[#8e8f8f]">
            Where accounts stop. Each step is a share of total signups.
          </p>
          <div className="mt-5 flex flex-col gap-4">
            <FunnelBar label="Signed up" count={funnel.signedUp} total={funnel.signedUp} />
            <FunnelBar
              label="Connected a channel"
              count={funnel.connectedChannel}
              total={funnel.signedUp}
            />
            <FunnelBar
              label="Created a campaign"
              count={funnel.createdCampaign}
              total={funnel.signedUp}
            />
            <FunnelBar
              label="Got an attributed join"
              count={funnel.gotAttributedJoin}
              total={funnel.signedUp}
            />
          </div>
          <p className="mt-4 text-[11px] text-[#b7b7b7]">
            The last step is the one that proves the product worked — someone joined through a
            campaign link and got attributed.
          </p>
        </div>

        <div className="rounded-[20px] border border-[#f2eeee] bg-white p-5 shadow-[0_20px_40px_0_rgba(0,0,0,0.03)] md:p-6">
          <div className="text-base font-medium text-[#494949]">Signups — last 30 days</div>
          <div className="mt-2">
            <SignupsChart data={data.signupSeries} />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[20px] border border-[#f2eeee] bg-white p-5 shadow-[0_20px_40px_0_rgba(0,0,0,0.03)] md:p-6">
        <div className="text-base font-medium text-[#494949]">Accounts</div>
        <p className="mt-0.5 text-xs text-[#8e8f8f]">
          Click an account with a connected channel to see their dashboard — the same growth,
          retention and campaign view they see themselves.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#f2eeee] text-left text-xs text-[#8e8f8f]">
                <th className="py-2 pr-4 font-normal">Account</th>
                <th className="py-2 pr-4 font-normal">Signed up</th>
                <th className="py-2 pr-4 font-normal">Last seen</th>
                <th className="py-2 pr-4 font-normal">Channels</th>
                <th className="py-2 pr-4 font-normal">Campaigns</th>
                <th className="py-2 pr-4 font-normal">Joins</th>
                <th className="py-2 pr-4 font-normal">Attributed</th>
                <th className="py-2 pr-4 font-normal">Last event</th>
                <th className="py-2 pr-4 font-normal">Stage</th>
              </tr>
            </thead>
            <tbody>
              {data.accounts.map((a) => {
                const clickable = a.channelCount > 0;
                const identity = a.telegramUsername ? `@${a.telegramUsername}` : a.email;
                const nameBlock = (
                  <>
                    <div className="font-medium text-[#11263c]">
                      {a.displayName ?? identity ?? "—"}
                      {a.isPlatformAdmin && (
                        <span className="ml-2 rounded-full bg-[#f4f2ff] px-2 py-0.5 text-[10px] font-medium text-[#3629b7]">
                          admin
                        </span>
                      )}
                    </div>
                    {a.displayName && identity && (
                      <div className="text-xs text-[#8e8f8f]">{identity}</div>
                    )}
                  </>
                );
                return (
                <tr
                  key={a.accountId}
                  className={`border-b border-[#f7f4f4] ${clickable ? "transition-colors hover:bg-[#faf9ff]" : ""}`}
                >
                  <td className="py-3 pr-4">
                    {clickable ? (
                      <Link href={`/admin/accounts/${a.accountId}`} className="block">
                        {nameBlock}
                      </Link>
                    ) : (
                      nameBlock
                    )}
                  </td>
                  <td className="whitespace-nowrap py-3 pr-4 text-[#8e8f8f]">
                    {new Date(a.signedUpAt).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap py-3 pr-4 text-[#8e8f8f]">
                    {relative(a.lastSignInAt)}
                  </td>
                  <td className="py-3 pr-4 text-[#494949]">
                    {a.channelCount}
                    {a.brokenChannelCount > 0 && (
                      <span className="ml-1 text-xs text-[#ff4267]">
                        ({a.brokenChannelCount} broken)
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-[#494949]">{a.campaignCount}</td>
                  <td className="py-3 pr-4 text-[#494949]">{a.joinsTracked}</td>
                  <td className="py-3 pr-4 text-[#494949]">{a.attributedJoins}</td>
                  <td className="whitespace-nowrap py-3 pr-4 text-[#8e8f8f]">
                    {relative(a.lastEventAt)}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${STAGE_CLASS[a.stage]}`}
                    >
                      {STAGE_LABEL[a.stage]}
                    </span>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
          {data.accounts.length === 0 && (
            <p className="mt-4 text-sm text-[#8e8f8f]">No accounts yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}
