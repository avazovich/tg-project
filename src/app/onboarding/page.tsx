import Link from "next/link";
import { redirect } from "next/navigation";
import Wordmark from "@/components/Wordmark";
import { getCurrentUser, ensureAccount } from "@/lib/account";
import { getOrCreateClaim } from "@/lib/channel-claim";
import { createAdminClient } from "@/lib/supabase-admin";
import { confirmChannel } from "./actions";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

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
      <div className="w-full max-w-md rounded-[24px] bg-white p-10 shadow-[0_40px_80px_0_rgba(28,31,46,0.12)]">
        <div className="mb-4">
          <Wordmark size="md" />
        </div>
        <h1 className="text-xl font-semibold text-[#11263c]">
          {channels && channels.length > 0 ? "Connect another channel" : "Connect your channel"}
        </h1>
        <p className="mt-1 text-sm text-[#8e8f8f]">
          Two quick steps so we know which Telegram channel is yours.
        </p>

        {channels && channels.length > 0 && (
          <div className="mt-4 rounded-[12px] border border-[#f2eeee] bg-[#f7f4f4] p-3 text-sm">
            <div className="text-xs text-[#8e8f8f]">Already connected:</div>
            <ul className="mt-1 text-[#494949]">
              {channels.map((ch) => (
                <li key={ch.id}>{ch.name}</li>
              ))}
            </ul>
            <Link href="/dashboard" className="mt-2 inline-block text-xs text-[#3629b7] hover:underline">
              ← Back to dashboard
            </Link>
          </div>
        )}

        {!detectedChannel && (
          <ol className="mt-6 flex flex-col gap-4 text-sm">
            <li className="rounded-[12px] border border-[#f2eeee] bg-[#f7f4f4] p-4">
              <div className="font-medium text-[#11263c]">
                1. Message the bot to link your account
              </div>
              <a
                href={dmLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block rounded-[12px] bg-[#3629b7] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#2d2296]"
              >
                Open Telegram &amp; message @{botUsername}
              </a>
            </li>
            <li className="rounded-[12px] border border-[#f2eeee] bg-[#f7f4f4] p-4">
              <div className="font-medium text-[#11263c]">2. Add the bot as admin to your channel</div>
              <p className="mt-1 text-xs text-[#8e8f8f]">
                Channel settings → Administrators → Add Admin → @{botUsername}.
                We&apos;ll detect it automatically once both steps are done.
              </p>
            </li>
          </ol>
        )}

        {!detectedChannel && (
          <a
            href="/onboarding"
            className="mt-6 inline-block rounded-[12px] border border-[#e7e7e7] px-3 py-2 text-sm text-[#494949] hover:bg-[#f7f4f4]"
          >
            I&apos;ve done both — check now
          </a>
        )}

        {detectedChannel && (
          <form action={confirmChannel} className="mt-6 flex flex-col gap-3">
            <input type="hidden" name="channelId" value={detectedChannel.id} />
            <p className="text-sm text-[#55a55e]">Channel detected!</p>
            <div>
              <label className="text-xs text-[#8e8f8f]" htmlFor="name">
                Name it something recognizable
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
              Confirm &amp; continue
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
