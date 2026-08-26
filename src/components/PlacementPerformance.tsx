import type { CampaignRow } from "@/lib/dashboard-data";

function fmtDuration(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const h = minutes / 60;
  return Number.isInteger(h) ? `${h}h` : `${h.toFixed(1)}h`;
}

function fmtWhen(d: Date) {
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Segment({
  label,
  value,
  share,
  color,
}: {
  label: string;
  value: number;
  share: number;
  color: string;
}) {
  return (
    <div className="flex-1">
      <div className="text-xs text-[#8e8f8f]">{label}</div>
      <div className="mt-0.5 text-lg font-semibold text-[#11263c]">{value}</div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#f2eeee]">
        <div className="h-full rounded-full" style={{ width: `${share}%`, background: color }} />
      </div>
    </div>
  );
}

// Answers the question a buyer actually has about a "1/24" style placement:
// did the premium top slot earn its price, or did the joins arrive later from
// the feed regardless?
export default function PlacementPerformance({ campaigns }: { campaigns: CampaignRow[] }) {
  const withPlacement = campaigns.filter((c) => c.placement);

  if (withPlacement.length === 0) {
    return (
      <p className="mt-4 text-sm text-[#8e8f8f]">
        No campaigns have a placement window set yet. Add one when creating or editing a campaign
        to see how a &ldquo;1 hour top / 24 hour feed&rdquo; buy actually performed.
      </p>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      {withPlacement.map((c) => {
        const p = c.placement!;
        const total = p.joinsInWindow + p.joinsAfter;
        const pctOf = (n: number) => (total > 0 ? (n / total) * 100 : 0);
        const notation = `${fmtDuration(c.topMinutes!)}/${c.feedHours}h`;
        const cacInWindow =
          c.budget && p.joinsInWindow > 0 ? c.budget / p.joinsInWindow : null;

        return (
          <div key={c.id} className="rounded-[12px] bg-[#f7f4f4] p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="font-medium text-[#11263c]">
                {c.name}
                <span className="ml-2 rounded-full bg-[#f4f2ff] px-2 py-0.5 text-xs font-medium text-[#3629b7]">
                  {notation}
                </span>
                {!p.windowEnded && (
                  <span className="ml-1.5 rounded-full bg-[#edffef] px-2 py-0.5 text-xs font-medium text-[#55a55e]">
                    running
                  </span>
                )}
              </div>
              <div className="text-xs text-[#8e8f8f]">
                {fmtWhen(p.window.startsAt)} → {fmtWhen(p.window.feedEndsAt)}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-5">
              <Segment
                label={`Top slot (first ${fmtDuration(c.topMinutes!)})`}
                value={p.joinsInTop}
                share={pctOf(p.joinsInTop)}
                color="#3629b7"
              />
              <Segment
                label="Rest of feed window"
                value={p.joinsInFeedOnly}
                share={pctOf(p.joinsInFeedOnly)}
                color="#8b7fe8"
              />
              <Segment
                label="After window closed"
                value={p.joinsAfter}
                share={pctOf(p.joinsAfter)}
                color="#c9c4e8"
              />
            </div>

            <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t border-[#eae6e6] pt-3 text-xs">
              <div className="flex gap-1.5">
                <dt className="text-[#8e8f8f]">Joins in paid window</dt>
                <dd className="font-medium text-[#494949]">{p.joinsInWindow}</dd>
              </div>
              <div className="flex gap-1.5">
                <dt className="text-[#8e8f8f]">Captured in top slot</dt>
                <dd className="font-medium text-[#494949]">
                  {p.topSharePct === null ? "—" : `${p.topSharePct.toFixed(0)}%`}
                </dd>
              </div>
              <div className="flex gap-1.5">
                <dt className="text-[#8e8f8f]">Still subscribed</dt>
                <dd className="font-medium text-[#494949]">
                  {p.retainedFromWindow}
                  {p.joinsInWindow > 0 && (
                    <span className="ml-1 text-[#b7b7b7]">
                      ({((p.retainedFromWindow / p.joinsInWindow) * 100).toFixed(0)}%)
                    </span>
                  )}
                </dd>
              </div>
              <div className="flex gap-1.5">
                <dt className="text-[#8e8f8f]">Cost per window join</dt>
                <dd className="font-medium text-[#494949]">
                  {cacInWindow === null
                    ? "—"
                    : cacInWindow.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </dd>
              </div>
            </dl>
          </div>
        );
      })}
    </div>
  );
}
