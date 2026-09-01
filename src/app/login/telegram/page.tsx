import Link from "next/link";
import Wordmark from "@/components/Wordmark";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { verifyTelegramCode } from "../actions";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";
import { t } from "@/i18n/interpolate";

export default async function TelegramLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const d = dict.loginTelegram;
  const botUsername = process.env.TELEGRAM_BOT_USERNAME;
  const dmLink = `https://t.me/${botUsername}?start=login`;

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6">
      <div className="animate-pop-in w-full max-w-sm rounded-[24px] bg-white p-10 shadow-[0_40px_80px_0_rgba(28,31,46,0.12)]">
        <div className="flex items-center justify-between">
          <Wordmark size="lg" />
          <LanguageSwitcher active={locale} label={dict.languageSwitcher.label} />
        </div>
        <p className="mt-2 text-sm text-[#8e8f8f]">{d.subtitle}</p>

        {error && (
          <p className="mt-4 rounded-[12px] border border-[#ffd9c4] bg-[#fff2ec] px-3 py-2 text-sm text-[#ff4267]">
            {error}
          </p>
        )}

        <ol className="mt-6 flex flex-col gap-4 text-sm">
          <li className="rounded-[12px] border border-[#f2eeee] bg-[#f7f4f4] p-4">
            <div className="font-medium text-[#11263c]">{d.step1Title}</div>
            <p className="mt-1 text-xs text-[#8e8f8f]">{d.step1Body}</p>
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
            <form action={verifyTelegramCode} className="mt-2 flex flex-col gap-2">
              <input
                name="code"
                required
                placeholder={d.codePlaceholder}
                autoCapitalize="characters"
                autoComplete="off"
                maxLength={7}
                className="w-full rounded-[12px] border border-[#e7e7e7] bg-white px-3 py-2 text-center text-lg font-medium uppercase tracking-[0.2em] outline-none focus:border-[#3629b7]"
              />
              <button
                type="submit"
                className="rounded-[12px] bg-[#3629b7] px-3 py-2 text-sm font-medium text-white hover:bg-[#2d2296]"
              >
                {d.verifyButton}
              </button>
            </form>
          </li>
        </ol>

        <Link
          href="/login"
          className="mt-6 inline-block text-xs text-[#8e8f8f] hover:text-[#3629b7] hover:underline"
        >
          {d.useEmailInstead}
        </Link>
      </div>
    </div>
  );
}
