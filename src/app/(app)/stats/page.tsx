import { requireOnboardedAccount } from "@/lib/account";
import { loadDashboardData, type QualityBand, type CampaignRow } from "@/lib/dashboard-data";
import { createCampaign, setCampaignStatus, updateCampaign } from "@/app/campaigns/actions";
import { trackedLinkUrl } from "@/lib/click-tracking";
import CopyLinkButton from "@/components/CopyLinkButton";
import PlacementFields from "@/components/PlacementFields";
import PlacementPerformance from "@/components/PlacementPerformance";

export const dynamic = "force-dynamic";

const QUALITY_LABEL: Record<QualityBand, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  unknown: "—",
};

const QUALITY_CLASS: Record<QualityBand, string> = {
  high: "bg-[#edffef] text-[#55a55e]",
  medium: "bg-[#fff8e6] text-[#b8860b]",
  low: "bg-[#fff2ec] text-[#ff4267]",
  unknown: "bg-[#f2eeee] text-[#8e8f8f]",
};

const SOURCE_OPTIONS = [
  { value: "paid_ad", label: "Paid ad" },
  { value: "influencer", label: "Influencer" },
  { value: "organic", label: "Organic" },
  { value: "cross_promo", label: "Cross-promo" },
  { value: "other", label: "Other" },
];

function pct(v: number | null) {
  return v === null ? "—" : `${v.toFixed(0)}%`;
}

function money(v: number | null) {
  return v === null ? "—" : v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

const inputClass =
  "mt-1 block rounded-[12px] border border-[#e7e7e7] bg-white px-3 py-2 text-sm outline-none focus:border-[#3629b7]";

function SummaryTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-[12px] bg-[#f7f4f4] px-4 py-3">
      <div className="text-xs text-[#8e8f8f]">{label}</div>
      <div className="mt-0.5 text-lg font-semibold text-[#11263c]">{value}</div>
      {hint && <div className="mt-0.5 text-[11px] text-[#b7b7b7]">{hint}</div>}
    </div>
  );
}

// A retention cell shows the % plus how many joins were old enough to count,
// so a flattering "100%" off a single join can't be mistaken for a trend.
function RetentionCell({ r }: { r: CampaignRow["retention7"] }) {
  return (
    <td className="py-3 pr-4 text-[#494949] whitespace-nowrap">
      {pct(r.pct)}
      {r.eligible > 0 && <span className="text-[#b7b7b7]"> ({r.eligible})</span>}
    </td>
  );
}

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; error?: string }>;
}) {
  const { activeChannel } = await requireOnboardedAccount();
  const data = await loadDashboardData(activeChannel.id);
  const { edit: editId, error } = await searchParams;

  const ranked = [...data.campaigns].sort(
    (a, b) =>
      (b.retention30.pct ?? b.retention7.pct ?? -1) - (a.retention30.pct ?? a.retention7.pct ?? -1)
  );

  return (
    <main className="w-full px-5 py-8 md:px-[68px] md:py-[58px]">
      <h1 className="text-2xl text-[#3629b7] font-semibold">Stats</h1>
      <p className="mt-1 text-sm text-[#8e8f8f]">
        {activeChannel.name} — campaign performance, ranked by retention.
      </p>

      {error && (
        <p className="mt-4 max-w-2xl rounded-[12px] border border-[#ffd9c4] bg-[#fff2ec] px-3 py-2 text-sm text-[#ff4267]">
          {error}
        </p>
      )}

      <div className="mt-8 rounded-[20px] border border-[#f2eeee] bg-white p-5 md:p-6 shadow-[0_20px_40px_0_rgba(0,0,0,0.03)]">
        <div className="text-base font-medium text-[#494949]">Spend efficiency</div>
        <p className="mt-0.5 text-xs text-[#8e8f8f]">
          Blended across campaigns that have an ad cost set.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <SummaryTile label="Total ad spend" value={money(data.totalSpend || null)} />
          <SummaryTile
            label="CAC"
            value={money(data.blendedCac)}
            hint="per subscriber acquired"
          />
          <SummaryTile
            label="Cost per retained"
            value={money(data.blendedCostPerRetained)}
            hint="per subscriber still here"
          />
          <SummaryTile
            label="Cost per click"
            value={money(data.blendedCpc)}
            hint={data.paidClicks > 0 ? `${data.paidClicks} tracked clicks` : "no tracked links yet"}
          />
          <SummaryTile
            label="Paid vs organic joins"
            value={`${data.paidJoined} / ${data.organicJoined}`}
          />
        </div>
      </div>

      <div className="mt-6 rounded-[20px] border border-[#f2eeee] bg-white p-5 md:p-6 shadow-[0_20px_40px_0_rgba(0,0,0,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-xs text-[#8e8f8f] border-b border-[#f2eeee]">
                <th className="py-2 pr-4 font-normal">Campaign</th>
                <th className="py-2 pr-4 font-normal">Source</th>
                <th className="py-2 pr-4 font-normal">Ad cost</th>
                <th className="py-2 pr-4 font-normal">Clicks</th>
                <th className="py-2 pr-4 font-normal">Click→Join</th>
                <th className="py-2 pr-4 font-normal">Joined</th>
                <th className="py-2 pr-4 font-normal">Active</th>
                <th className="py-2 pr-4 font-normal">Churn</th>
                <th className="py-2 pr-4 font-normal">CAC</th>
                <th className="py-2 pr-4 font-normal">CPC</th>
                <th className="py-2 pr-4 font-normal">Cost/ret.</th>
                <th className="py-2 pr-4 font-normal">1d</th>
                <th className="py-2 pr-4 font-normal">7d</th>
                <th className="py-2 pr-4 font-normal">30d</th>
                <th className="py-2 pr-4 font-normal">90d</th>
                <th className="py-2 pr-4 font-normal">Quality</th>
                <th className="py-2 pr-4 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((c) =>
                c.id === editId ? (
                  <tr key={c.id} className="border-b border-[#f7f4f4] bg-[#faf9ff]">
                    <td colSpan={17} className="py-4 pr-4">
                      <form
                        action={updateCampaign}
                        className="flex flex-wrap items-end gap-3 text-sm"
                      >
                        <input type="hidden" name="campaignId" value={c.id} />
                        <div>
                          <label className="text-xs text-[#8e8f8f]" htmlFor={`name-${c.id}`}>
                            Campaign name
                          </label>
                          <input
                            id={`name-${c.id}`}
                            name="name"
                            defaultValue={c.name}
                            required
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#8e8f8f]" htmlFor={`source-${c.id}`}>
                            Source
                          </label>
                          <select
                            id={`source-${c.id}`}
                            name="sourceCategory"
                            defaultValue={c.sourceCategory}
                            className={inputClass}
                          >
                            {SOURCE_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-[#8e8f8f]" htmlFor={`budget-${c.id}`}>
                            Ad cost
                          </label>
                          <input
                            id={`budget-${c.id}`}
                            name="budget"
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={c.budget ?? ""}
                            placeholder="not set"
                            className={`${inputClass} w-32`}
                          />
                        </div>
                        <PlacementFields
                          idPrefix={c.id}
                          promoStartsAt={c.promoStartsAt}
                          topMinutes={c.topMinutes}
                          feedHours={c.feedHours}
                        />
                        {!c.clickSlug && (
                          <label className="flex items-center gap-2 pb-2 text-xs text-[#8e8f8f]">
                            <input type="checkbox" name="trackClicks" />
                            Turn on click tracking
                          </label>
                        )}
                        <button
                          type="submit"
                          className="rounded-[12px] bg-[#3629b7] px-4 py-2 text-sm font-medium text-white hover:bg-[#2d2296]"
                        >
                          Save
                        </button>
                        <a
                          href="/stats"
                          className="rounded-[12px] border border-[#e7e7e7] px-4 py-2 text-sm text-[#494949] hover:bg-[#f7f4f4]"
                        >
                          Cancel
                        </a>
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr key={c.id} className="border-b border-[#f7f4f4]">
                    <td className="py-3 pr-4">
                      <div className="font-medium text-[#11263c]">{c.name}</div>
                      {(() => {
                        const displayUrl = c.clickSlug ? trackedLinkUrl(c.clickSlug) : c.inviteLinkUrl;
                        return (
                          displayUrl && (
                            <div className="mt-0.5 flex items-center gap-2">
                              <a
                                href={displayUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#3629b7] hover:underline"
                              >
                                {displayUrl.replace("https://", "")}
                              </a>
                              <CopyLinkButton url={displayUrl} />
                            </div>
                          )
                        );
                      })()}
                    </td>
                    <td className="py-3 pr-4 text-[#8e8f8f] whitespace-nowrap">
                      {c.sourceCategory}
                    </td>
                    <td className="py-3 pr-4 text-[#494949]">{money(c.budget)}</td>
                    <td className="py-3 pr-4 text-[#494949]">
                      {c.clickSlug ? c.clicks : <span className="text-[#b7b7b7]">—</span>}
                    </td>
                    <td className="py-3 pr-4 text-[#494949]">
                      {c.clickSlug ? pct(c.clickToJoinPct) : <span className="text-[#b7b7b7]">—</span>}
                    </td>
                    <td className="py-3 pr-4 text-[#494949]">{c.joined}</td>
                    <td className="py-3 pr-4 text-[#494949]">{c.active}</td>
                    <td className="py-3 pr-4 text-[#494949] whitespace-nowrap">
                      {pct(c.churnRate)}
                      {c.churned > 0 && <span className="text-[#b7b7b7]"> ({c.churned})</span>}
                    </td>
                    <td className="py-3 pr-4 text-[#494949]">{money(c.cac)}</td>
                    <td className="py-3 pr-4 text-[#494949]">
                      {c.clickSlug ? money(c.costPerClick) : <span className="text-[#b7b7b7]">—</span>}
                    </td>
                    <td className="py-3 pr-4 text-[#494949]">{money(c.costPerRetained)}</td>
                    <RetentionCell r={c.retention1} />
                    <RetentionCell r={c.retention7} />
                    <RetentionCell r={c.retention30} />
                    <RetentionCell r={c.retention90} />
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${QUALITY_CLASS[c.quality]}`}
                      >
                        {QUALITY_LABEL[c.quality]}
                      </span>
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/stats?edit=${c.id}`}
                          className="text-[#3629b7] hover:underline"
                        >
                          edit
                        </a>
                        <form action={setCampaignStatus} className="flex items-center gap-2">
                          <input type="hidden" name="campaignId" value={c.id} />
                          {c.status !== "paused" && (
                            <button
                              name="status"
                              value="paused"
                              className="text-[#8e8f8f] hover:text-[#3629b7] hover:underline"
                            >
                              pause
                            </button>
                          )}
                          {c.status !== "active" && (
                            <button
                              name="status"
                              value="active"
                              className="text-[#8e8f8f] hover:text-[#3629b7] hover:underline"
                            >
                              activate
                            </button>
                          )}
                          {c.status !== "archived" && (
                            <button
                              name="status"
                              value="archived"
                              className="text-[#8e8f8f] hover:text-[#3629b7] hover:underline"
                            >
                              archive
                            </button>
                          )}
                        </form>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
          {data.campaigns.length === 0 && (
            <p className="mt-4 text-sm text-[#8e8f8f]">No campaigns yet.</p>
          )}
          {data.organicJoined > 0 && (
            <p className="mt-4 text-xs text-[#8e8f8f]">
              + {data.organicJoined} organic joins with no invite link attached.
            </p>
          )}
          <p className="mt-3 text-[11px] text-[#b7b7b7]">
            Retention columns show the % of joins still subscribed after that many days, with the
            number of joins old enough to count in parentheses. CAC = ad cost ÷ joined.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-[20px] border border-[#f2eeee] bg-white p-5 md:p-6 shadow-[0_20px_40px_0_rgba(0,0,0,0.03)]">
        <div className="text-base font-medium text-[#494949]">Placement performance</div>
        <p className="mt-0.5 text-xs text-[#8e8f8f]">
          How joins landed across the paid window — was the top slot worth its premium?
        </p>
        <PlacementPerformance campaigns={data.campaigns} />
      </div>

      <div className="mt-6 rounded-[20px] border border-[#f2eeee] bg-white p-5 md:p-6 shadow-[0_20px_40px_0_rgba(0,0,0,0.03)]">
        <div className="text-base font-medium text-[#494949]">New campaign</div>
        <form action={createCampaign} className="mt-4 flex flex-wrap items-end gap-3 text-sm">
          <input type="hidden" name="channelId" value={activeChannel.id} />
          <div>
            <label className="text-xs text-[#8e8f8f]" htmlFor="name">
              Name
            </label>
            <input id="name" name="name" required className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-[#8e8f8f]" htmlFor="sourceCategory">
              Source
            </label>
            <select id="sourceCategory" name="sourceCategory" className={inputClass}>
              {SOURCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#8e8f8f]" htmlFor="budget">
              Ad cost (optional)
            </label>
            <input
              id="budget"
              name="budget"
              type="number"
              step="0.01"
              min="0"
              className={`${inputClass} w-32`}
            />
          </div>
          <PlacementFields idPrefix="new" />
          <label className="flex items-center gap-2 pb-2 text-xs text-[#8e8f8f]">
            <input type="checkbox" name="trackClicks" />
            Track clicks + subs on this link
          </label>
          <button
            type="submit"
            className="rounded-[12px] bg-[#3629b7] px-4 py-2 text-sm font-medium text-white hover:bg-[#2d2296]"
          >
            Create + generate invite link
          </button>
        </form>
      </div>
    </main>
  );
}
