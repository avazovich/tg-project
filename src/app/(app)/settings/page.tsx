import Link from "next/link";
import { Suspense } from "react";
import { requireOnboardedAccount } from "@/lib/account";
import { canInviteUsers } from "@/lib/telegram";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";
import { INTL_LOCALE } from "@/i18n/config";
import { t as interpolate } from "@/i18n/interpolate";
import type { Dictionary } from "@/i18n/dictionary";

export const dynamic = "force-dynamic";

// Streamed separately (like the Dashboard's live member count) so a slow
// Telegram round trip never blocks the rest of the page from painting.
async function InvitePermissionCheck({
  chatId,
  t,
}: {
  chatId: number;
  t: Dictionary["settings"]["invitePermission"];
}) {
  const ok = await canInviteUsers(chatId);
  if (ok !== false) return null; // true = fine, null = couldn't check, say nothing either way

  return (
    <div className="mt-3 rounded-[10px] border border-[#ffd9c4] bg-[#fff2ec] px-3 py-2.5 text-xs text-[#9b5a3d]">
      <span className="font-medium text-[#ff4267]">{t.title}</span> {t.body}
    </div>
  );
}

const BOT_STATUS_CLASS: Record<string, string> = {
  active: "bg-[#edffef] text-[#55a55e]",
  removed: "bg-[#fff2ec] text-[#ff4267]",
  error: "bg-[#fff2ec] text-[#ff4267]",
};

export default async function SettingsPage() {
  const { channels } = await requireOnboardedAccount();
  const broken = channels.filter((c) => c.bot_status !== "active");
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const d = dict.settings;
  const BOT_STATUS_HINT: Record<string, string> = d.botStatusHint;

  return (
    <main className="w-full px-5 py-8 md:px-[68px] md:py-[58px]">
      <h1 className="text-2xl font-semibold text-[#3629b7]">{d.title}</h1>
      <p className="mt-1 text-sm text-[#8e8f8f]">{d.subtitle}</p>

      {broken.length > 0 && (
        <p className="mt-4 max-w-3xl rounded-[12px] border border-[#ffd9c4] bg-[#fff2ec] px-4 py-3 text-sm text-[#ff4267]">
          {broken.length === 1
            ? interpolate(d.trackingStoppedOne, { channel: broken[0].name })
            : interpolate(d.trackingStoppedMany, { count: broken.length })}{" "}
          {d.trackingStoppedSuffix}
        </p>
      )}

      <div className="mt-6 max-w-3xl rounded-[20px] border border-[#f2eeee] bg-white p-5 shadow-[0_20px_40px_0_rgba(0,0,0,0.03)] md:p-6">
        <div className="text-base font-medium text-[#494949]">{d.connectedChannels}</div>
        <p className="mt-0.5 text-xs text-[#8e8f8f]">{d.connectedChannelsNote}</p>

        <div className="mt-4 flex flex-col gap-3">
          {channels.map((ch) => (
            <div key={ch.id} className="rounded-[12px] bg-[#f7f4f4] px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-[#11263c]">{ch.name}</div>
                  <div className="mt-0.5 text-xs text-[#8e8f8f]">
                    {BOT_STATUS_HINT[ch.bot_status] ?? ""}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      BOT_STATUS_CLASS[ch.bot_status] ?? "bg-[#f2eeee] text-[#8e8f8f]"
                    }`}
                  >
                    {d.botStatusLabel[ch.bot_status as keyof typeof d.botStatusLabel] ?? ch.bot_status}
                  </span>
                  {ch.bot_status !== "active" && (
                    <Link
                      href="/onboarding"
                      className="rounded-[10px] border border-[#e7e7e7] bg-white px-3 py-1.5 text-xs font-medium text-[#3629b7] hover:bg-[#f4f2ff]"
                    >
                      {d.reconnect}
                    </Link>
                  )}
                </div>
              </div>
              <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 border-t border-[#eae6e6] pt-3 text-xs">
                <div className="flex gap-1.5">
                  <dt className="text-[#8e8f8f]">{d.chatId}</dt>
                  <dd className="text-[#494949]">{ch.telegram_chat_id}</dd>
                </div>
                <div className="flex gap-1.5">
                  <dt className="text-[#8e8f8f]">{d.trackingSince}</dt>
                  <dd className="text-[#494949]">
                    {new Date(ch.created_at).toLocaleDateString(INTL_LOCALE[locale], {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </dd>
                </div>
              </dl>
              {ch.bot_status === "active" && (
                <Suspense fallback={null}>
                  <InvitePermissionCheck chatId={ch.telegram_chat_id} t={d.invitePermission} />
                </Suspense>
              )}
            </div>
          ))}
        </div>

        <Link
          href="/onboarding"
          className="mt-4 inline-block rounded-[12px] border border-[#e7e7e7] px-3 py-2 text-sm text-[#494949] hover:bg-[#f7f4f4]"
        >
          {dict.common.connectAnotherChannel}
        </Link>
      </div>

      <div className="mt-6 max-w-3xl rounded-[20px] border border-[#f2eeee] bg-white p-5 shadow-[0_20px_40px_0_rgba(0,0,0,0.03)] md:p-6">
        <div className="text-base font-medium text-[#494949]">{d.howTrackingWorks}</div>
        <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm text-[#8e8f8f]">
          {d.howTrackingWorksList.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}
