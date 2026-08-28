import type { CampaignRow } from "@/lib/dashboard-data";
import { trackedLinkUrl } from "@/lib/click-tracking";
import CopyLinkButton from "./CopyLinkButton";

const STATUS_CLASS: Record<string, string> = {
  active: "bg-[#edffef] text-[#55a55e]",
  paused: "bg-[#fff8e6] text-[#b8860b]",
  archived: "bg-[#f2eeee] text-[#8e8f8f]",
};

// Compact read-only view of every campaign link — shown on the Dashboard so
// the links are grabbable without a detour through Stats.
export default function CampaignLinksTable({ campaigns }: { campaigns: CampaignRow[] }) {
  if (campaigns.length === 0) {
    return (
      <p className="mt-4 text-sm text-[#8e8f8f]">
        No campaign links yet — create one on the Stats page to start attributing joins.
      </p>
    );
  }

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left text-xs text-[#8e8f8f] border-b border-[#f2eeee]">
            <th className="py-2 pr-4 font-normal">Campaign</th>
            <th className="py-2 pr-4 font-normal">Invite link</th>
            <th className="py-2 pr-4 font-normal">Joined</th>
            <th className="py-2 pr-4 font-normal">Active</th>
            <th className="py-2 pr-4 font-normal">Status</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => {
            const displayUrl = c.clickSlug ? trackedLinkUrl(c.clickSlug) : c.inviteLinkUrl;
            return (
            <tr key={c.id} className="border-b border-[#f7f4f4]">
              <td className="py-3 pr-4 font-medium text-[#11263c]">{c.name}</td>
              <td className="py-3 pr-4">
                {displayUrl ? (
                  <div className="flex items-center gap-2">
                    <a
                      href={displayUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3629b7] hover:underline"
                    >
                      {displayUrl.replace("https://", "")}
                    </a>
                    <CopyLinkButton url={displayUrl} />
                  </div>
                ) : (
                  <span className="text-[#8e8f8f]">—</span>
                )}
              </td>
              <td className="py-3 pr-4 text-[#494949]">{c.joined}</td>
              <td className="py-3 pr-4 text-[#494949]">{c.active}</td>
              <td className="py-3 pr-4">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    STATUS_CLASS[c.status] ?? "bg-[#f2eeee] text-[#8e8f8f]"
                  }`}
                >
                  {c.status}
                </span>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
