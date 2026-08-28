import Link from "next/link";
import Wordmark from "@/components/Wordmark";
import { verifyTelegramCode } from "../actions";

export default async function TelegramLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const botUsername = process.env.TELEGRAM_BOT_USERNAME;
  const dmLink = `https://t.me/${botUsername}?start=login`;

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6">
      <div className="animate-pop-in w-full max-w-sm rounded-[24px] bg-white p-10 shadow-[0_40px_80px_0_rgba(28,31,46,0.12)]">
        <Wordmark size="lg" />
        <p className="mt-2 text-sm text-[#8e8f8f]">Sign in with Telegram — no email needed.</p>

        {error && (
          <p className="mt-4 rounded-[12px] border border-[#ffd9c4] bg-[#fff2ec] px-3 py-2 text-sm text-[#ff4267]">
            {error}
          </p>
        )}

        <ol className="mt-6 flex flex-col gap-4 text-sm">
          <li className="rounded-[12px] border border-[#f2eeee] bg-[#f7f4f4] p-4">
            <div className="font-medium text-[#11263c]">1. Message our bot</div>
            <p className="mt-1 text-xs text-[#8e8f8f]">
              It&apos;ll say hello and give you a sign-in code.
            </p>
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
            <div className="font-medium text-[#11263c]">2. Enter the code here</div>
            <form action={verifyTelegramCode} className="mt-2 flex flex-col gap-2">
              <input
                name="code"
                required
                placeholder="8F4-K29"
                autoCapitalize="characters"
                autoComplete="off"
                maxLength={7}
                className="w-full rounded-[12px] border border-[#e7e7e7] bg-white px-3 py-2 text-center text-lg font-medium uppercase tracking-[0.2em] outline-none focus:border-[#3629b7]"
              />
              <button
                type="submit"
                className="rounded-[12px] bg-[#3629b7] px-3 py-2 text-sm font-medium text-white hover:bg-[#2d2296]"
              >
                Verify &amp; continue
              </button>
            </form>
          </li>
        </ol>

        <Link
          href="/login"
          className="mt-6 inline-block text-xs text-[#8e8f8f] hover:text-[#3629b7] hover:underline"
        >
          ← Use email instead
        </Link>
      </div>
    </div>
  );
}
