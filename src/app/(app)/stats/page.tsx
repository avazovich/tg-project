import { requireOnboardedAccount } from "@/lib/account";
import { loadDashboardData, type QualityBand, type CampaignRow } from "@/lib/dashboard-data";
import { createCampaign, setCampaignStatus, updateCampaign } from "@/app/campaigns/actions";
import { trackedLinkUrl } from "@/lib/click-tracking";
import CopyLinkButton from "@/components/CopyLinkButton";
import PlacementFields from "@/components/PlacementFields";
import PlacementPerformance from "@/components/PlacementPerformance";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";
import { INTL_LOCALE } from "@/i18n/config";
import { t as interpolate } from "@/i18n/interpolate";
import type { Dictionary } from "@/i18n/dictionary";

export const dynamic = "force-dynamic";

const QUALITY_CLASS: Record<QualityBand, string> = {
  high: "bg-[#edffef] text-[#55a55e]",
  medium: "bg-[#fff8e6] text-[#b8860b]",
  low: "bg-[#fff2ec] text-[#ff4267]",
  unknown: "bg-[#f2eeee] text-[#8e8f8f]",
};

function pct(v: number | null) {
  return v === null ? "—" : `${v.toFixed(0)}%`;
}

function money(v: number | null, intlLocale: string) {
  return v === null ? "—" : v.toLocaleString(intlLocale, { maximumFractionDigits: 2 });
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
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const intlLocale = INTL_LOCALE[locale];
  const s = dict.stats;
  const SOURCE_OPTIONS: { value: keyof Dictionary["stats"]["sourceOptions"]; label: string }[] = [
    { value: "paid_ad", label: s.sourceOptions.paid_ad },
    { value: "influencer", label: s.sourceOptions.influencer },
    { value: "organic", label: s.sourceOptions.organic },
    { value: "cross_promo", label: s.sourceOptions.cross_promo },
    { value: "other", label: s.sourceOptions.other },
  ];

  const ranked = [...data.campaigns].sort(
    (a, b) =>
      (b.retention30.pct ?? b.retention7.pct ?? -1) - (a.retention30.pct ?? a.retention7.pct ?? -1)
  );

  return (
    <main className="w-full px-5 py-8 md:px-[68px] md:py-[58px]">
      <h1 className="text-2xl text-[#3629b7] font-semibold">{s.title}</h1>
      <p className="mt-1 text-sm text-[#8e8f8f]">
        {interpolate(s.subtitle, { channel: activeChannel.name })}
      </p>

      {error && (
        <p className="mt-4 max-w-2xl rounded-[12px] border border-[#ffd9c4] bg-[#fff2ec] px-3 py-2 text-sm text-[#ff4267]">
          {error}
        </p>
      )}

      <div className="mt-8 rounded-[20px] border border-[#f2eeee] bg-white p-5 md:p-6 shadow-[0_20px_40px_0_rgba(0,0,0,0.03)]">
        <div className="text-base font-medium text-[#494949]">{s.spendEfficiency}</div>
        <p className="mt-0.5 text-xs text-[#8e8f8f]">{s.spendEfficiencyNote}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <SummaryTile label={s.totalAdSpend} value={money(data.totalSpend || null, intlLocale)} />
          <SummaryTile
            label={s.cac}
            value={money(data.blendedCac, intlLocale)}
            hint={s.perSubscriberAcquired}
          />
          <SummaryTile
            label={s.costPerRetained}
            value={money(data.blendedCostPerRetained, intlLocale)}
            hint={s.perSubscriberStillHere}
          />
          <SummaryTile
            label={s.costPerClick}
            value={money(data.blendedCpc, intlLocale)}
            hint={
              data.paidClicks > 0
                ? interpolate(s.trackedClicksN, { count: data.paidClicks })
                : s.noTrackedLinksYet
            }
          />
          <SummaryTile
            label={s.paidVsOrganicJoins}
            value={`${data.paidJoined} / ${data.organicJoined}`}
          />
        </div>
      </div>

      <div className="mt-6 rounded-[20px] border border-[#f2eeee] bg-white p-5 md:p-6 shadow-[0_20px_40px_0_rgba(0,0,0,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-xs text-[#8e8f8f] border-b border-[#f2eeee]">
                <th className="py-2 pr-4 font-normal">{s.table.campaign}</th>
                <th className="py-2 pr-4 font-normal">{s.table.source}</th>
                <th className="py-2 pr-4 font-normal">{s.table.adCost}</th>
                <th className="py-2 pr-4 font-normal">{s.table.clicks}</th>
                <th className="py-2 pr-4 font-normal">{s.table.clickToJoin}</th>
                <th className="py-2 pr-4 font-normal">{s.table.joined}</th>
                <th className="py-2 pr-4 font-normal">{s.table.active}</th>
                <th className="py-2 pr-4 font-normal">{s.table.churn}</th>
                <th className="py-2 pr-4 font-normal">{s.table.cac}</th>
                <th className="py-2 pr-4 font-normal">{s.table.cpc}</th>
                <th className="py-2 pr-4 font-normal">{s.table.costPerRet}</th>
                <th className="py-2 pr-4 font-normal">{s.table.d1}</th>
                <th className="py-2 pr-4 font-normal">{s.table.d7}</th>
                <th className="py-2 pr-4 font-normal">{s.table.d30}</th>
                <th className="py-2 pr-4 font-normal">{s.table.d90}</th>
                <th className="py-2 pr-4 font-normal">{s.table.quality}</th>
                <th className="py-2 pr-4 font-normal">{s.table.actions}</th>
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
                            {s.editForm.campaignName}
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
                            {s.editForm.source}
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
                            {s.editForm.adCost}
                          </label>
                          <input
                            id={`budget-${c.id}`}
                            name="budget"
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={c.budget ?? ""}
                            placeholder={s.editForm.notSet}
                            className={`${inputClass} w-32`}
                          />
                        </div>
                        <PlacementFields
                          idPrefix={c.id}
                          promoStartsAt={c.promoStartsAt}
                          topMinutes={c.topMinutes}
                          feedHours={c.feedHours}
                          t={dict.placementFields}
                        />
                        {!c.clickSlug && (
                          <label className="flex items-center gap-2 pb-2 text-xs text-[#8e8f8f]">
                            <input type="checkbox" name="trackClicks" />
                            {s.editForm.turnOnClickTracking}
                          </label>
                        )}
                        <button
                          type="submit"
                          className="rounded-[12px] bg-[#3629b7] px-4 py-2 text-sm font-medium text-white hover:bg-[#2d2296]"
                        >
                          {s.editForm.save}
                        </button>
                        <a
                          href="/stats"
                          className="rounded-[12px] border border-[#e7e7e7] px-4 py-2 text-sm text-[#494949] hover:bg-[#f7f4f4]"
                        >
                          {s.editForm.cancel}
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
                              <CopyLinkButton
                                url={displayUrl}
                                copyLabel={dict.copyLinkButton.copy}
                                copiedLabel={dict.copyLinkButton.copied}
                              />
                            </div>
                          )
                        );
                      })()}
                    </td>
                    <td className="py-3 pr-4 text-[#8e8f8f] whitespace-nowrap">
                      {s.sourceOptions[c.sourceCategory as keyof typeof s.sourceOptions] ?? c.sourceCategory}
                    </td>
                    <td className="py-3 pr-4 text-[#494949]">{money(c.budget, intlLocale)}</td>
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
                    <td className="py-3 pr-4 text-[#494949]">{money(c.cac, intlLocale)}</td>
                    <td className="py-3 pr-4 text-[#494949]">
                      {c.clickSlug ? money(c.costPerClick, intlLocale) : <span className="text-[#b7b7b7]">—</span>}
                    </td>
                    <td className="py-3 pr-4 text-[#494949]">{money(c.costPerRetained, intlLocale)}</td>
                    <RetentionCell r={c.retention1} />
                    <RetentionCell r={c.retention7} />
                    <RetentionCell r={c.retention30} />
                    <RetentionCell r={c.retention90} />
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${QUALITY_CLASS[c.quality]}`}
                      >
                        {s.quality[c.quality]}
                      </span>
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/stats?edit=${c.id}`}
                          className="text-[#3629b7] hover:underline"
                        >
                          {s.row.edit}
                        </a>
                        <form action={setCampaignStatus} className="flex items-center gap-2">
                          <input type="hidden" name="campaignId" value={c.id} />
                          {c.status !== "paused" && (
                            <button
                              name="status"
                              value="paused"
                              className="text-[#8e8f8f] hover:text-[#3629b7] hover:underline"
                            >
                              {s.row.pause}
                            </button>
                          )}
                          {c.status !== "active" && (
                            <button
                              name="status"
                              value="active"
                              className="text-[#8e8f8f] hover:text-[#3629b7] hover:underline"
                            >
                              {s.row.activate}
                            </button>
                          )}
                          {c.status !== "archived" && (
                            <button
                              name="status"
                              value="archived"
                              className="text-[#8e8f8f] hover:text-[#3629b7] hover:underline"
                            >
                              {s.row.archive}
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
            <p className="mt-4 text-sm text-[#8e8f8f]">{s.noCampaignsYet}</p>
          )}
          {data.organicJoined > 0 && (
            <p className="mt-4 text-xs text-[#8e8f8f]">
              {interpolate(s.organicJoinsNote, { count: data.organicJoined })}
            </p>
          )}
          <p className="mt-3 text-[11px] text-[#b7b7b7]">{s.retentionNote}</p>
        </div>
      </div>

      <div className="mt-6 rounded-[20px] border border-[#f2eeee] bg-white p-5 md:p-6 shadow-[0_20px_40px_0_rgba(0,0,0,0.03)]">
        <div className="text-base font-medium text-[#494949]">{s.placementPerformance}</div>
        <p className="mt-0.5 text-xs text-[#8e8f8f]">{s.placementPerformanceNote}</p>
        <PlacementPerformance
          campaigns={data.campaigns}
          t={dict.placementPerformance}
          intlLocale={intlLocale}
        />
      </div>

      <div className="mt-6 rounded-[20px] border border-[#f2eeee] bg-white p-5 md:p-6 shadow-[0_20px_40px_0_rgba(0,0,0,0.03)]">
        <div className="text-base font-medium text-[#494949]">{s.newCampaign}</div>
        <form action={createCampaign} className="mt-4 flex flex-wrap items-end gap-3 text-sm">
          <input type="hidden" name="channelId" value={activeChannel.id} />
          <div>
            <label className="text-xs text-[#8e8f8f]" htmlFor="name">
              {s.newForm.name}
            </label>
            <input id="name" name="name" required className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-[#8e8f8f]" htmlFor="sourceCategory">
              {s.newForm.source}
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
              {s.newForm.adCostOptional}
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
          <PlacementFields idPrefix="new" t={dict.placementFields} />
          <label className="flex items-center gap-2 pb-2 text-xs text-[#8e8f8f]">
            <input type="checkbox" name="trackClicks" />
            {s.newForm.trackClicks}
          </label>
          <button
            type="submit"
            className="rounded-[12px] bg-[#3629b7] px-4 py-2 text-sm font-medium text-white hover:bg-[#2d2296]"
          >
            {s.newForm.submit}
          </button>
        </form>
      </div>
    </main>
  );
}
