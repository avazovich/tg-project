import Link from "next/link";
import { redirect } from "next/navigation";
import Wordmark from "@/components/Wordmark";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getCurrentUser, ensureAccount } from "@/lib/account";
import { getOrCreateClaim } from "@/lib/channel-claim";
import { createAdminClient } from "@/lib/supabase-admin";
import { confirmChannel } from "./actions";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";
import { t } from "@/i18n/interpolate";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const d = dict.onboarding;

  const accountId = await ensureAccount(user.id, user.email);
  const admin = createAdminClient();

  const { data: channels } = await admin
    .from("channels")
    .select("id, name")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false });

  const claim = await getOrCreateClaim(accountId);

  let detectedChannel: { id: string; name: string } | null = null;
  if (claim.claimed_channel_id) {
    const { data } = await admin
      .from("channels")
      .select("id, name")
      .eq("id", claim.claimed_channel_id)
      .single();
    detectedChannel = data;
  }

  const botUsername = process.env.TELEGRAM_BOT_USERNAME;
  const dmLink = `https://t.me/${botUsername}?start=${claim.claim_code}`;

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6">
      <div className="animate-pop-in w-full max-w-md rounded-[24px] bg-white p-10 shadow-[0_40px_80px_0_rgba(28,31,46,0.12)]">
        <div className="mb-4 flex items-center justify-between">
          <Wordmark size="md" />
          <LanguageSwitcher active={locale} label={dict.languageSwitcher.label} />
        </div>
        <h1 className="text-xl font-semibold text-[#11263c]">
          {channels && channels.length > 0 ? d.titleAnother : d.titleFirst}
        </h1>
        <p className="mt-1 text-sm text-[#8e8f8f]">{d.subtitle}</p>

        {channels && channels.length > 0 && (
          <div className="mt-4 rounded-[12px] border border-[#f2eeee] bg-[#f7f4f4] p-3 text-sm">
            <div className="text-xs text-[#8e8f8f]">{d.alreadyConnected}</div>
            <ul className="mt-1 text-[#494949]">
              {channels.map((ch) => (
                <li key={ch.id}>{ch.name}</li>
              ))}
            </ul>
            <Link href="/dashboard" className="mt-2 inline-block text-xs text-[#3629b7] hover:underline">
              {d.backToDashboard}
            </Link>
          </div>
        )}

        {!detectedChannel && (
          <ol className="mt-6 flex flex-col gap-4 text-sm">
            <li className="rounded-[12px] border border-[#f2eeee] bg-[#f7f4f4] p-4">
              <div className="font-medium text-[#11263c]">{d.step1Title}</div>
              <a
                href={dmLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block rounded-[12px] bg-[#3629b7] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#2d2296]"
              >
                {t(d.openTelegram, { botUsername: botUsername ?? "" })}
              </a>
            </li>
            <li className="rounded-[12px] border border-[#f2eeee] bg-[#f7f4f4] p-4">
              <div className="font-medium text-[#11263c]">{d.step2Title}</div>
              <p className="mt-1 text-xs text-[#8e8f8f]">
                {t(d.step2Body, { botUsername: botUsername ?? "" })}
              </p>
            </li>
          </ol>
        )}

        {!detectedChannel && (
          <a
            href="/onboarding"
            className="mt-6 inline-block rounded-[12px] border border-[#e7e7e7] px-3 py-2 text-sm text-[#494949] hover:bg-[#f7f4f4]"
          >
            {d.checkNow}
          </a>
        )}

        {detectedChannel && (
          <form action={confirmChannel} className="mt-6 flex flex-col gap-3">
            <input type="hidden" name="channelId" value={detectedChannel.id} />
            <p className="text-sm text-[#55a55e]">{d.channelDetected}</p>
            <div>
              <label className="text-xs text-[#8e8f8f]" htmlFor="name">
                {d.nameItLabel}
              </label>
              <input
                id="name"
                name="name"
                defaultValue={detectedChannel.name}
                className="mt-1 w-full rounded-[12px] border border-[#e7e7e7] bg-white px-3 py-2 text-sm outline-none focus:border-[#3629b7]"
              />
            </div>
            <button
              type="submit"
              className="rounded-[12px] bg-[#3629b7] px-3 py-2 text-sm font-medium text-white hover:bg-[#2d2296]"
            >
              {d.confirmButton}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
