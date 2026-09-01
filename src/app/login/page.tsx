import Link from "next/link";
import { signIn, signUp } from "./actions";
import Wordmark from "@/components/Wordmark";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const d = dict.login;

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6">
      <div className="animate-pop-in w-full max-w-sm rounded-[24px] bg-white p-10 shadow-[0_40px_80px_0_rgba(28,31,46,0.12)]">
        <div className="flex items-center justify-between">
          <Wordmark size="lg" />
          <LanguageSwitcher active={locale} label={dict.languageSwitcher.label} />
        </div>
        <p className="mt-2 text-sm text-[#8e8f8f]">{d.subtitle}</p>

        {message && (
          <p className="mt-4 rounded-[12px] border border-[#c7f2cb] bg-[#edffef] px-3 py-2 text-sm text-[#55a55e]">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-[12px] border border-[#ffd9c4] bg-[#fff2ec] px-3 py-2 text-sm text-[#ff4267]">
            {error}
          </p>
        )}

        <Link
          href="/login/telegram"
          className="mt-6 flex items-center justify-center gap-2 rounded-[12px] bg-[#3629b7] px-3 py-2.5 text-sm font-medium text-white hover:bg-[#2d2296]"
        >
          {d.continueWithTelegram}
        </Link>

        <div className="mt-5 flex items-center gap-3 text-xs text-[#b7b7b7]">
          <div className="h-px flex-1 bg-[#f2eeee]" />
          {d.orContinueWithEmail}
          <div className="h-px flex-1 bg-[#f2eeee]" />
        </div>

        <form className="mt-4 flex flex-col gap-3">
          <div>
            <label className="text-xs text-[#8e8f8f]" htmlFor="email">
              {d.email}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-[12px] border border-[#e7e7e7] bg-white px-3 py-2 text-sm outline-none focus:border-[#3629b7]"
            />
          </div>
          <div>
            <label className="text-xs text-[#8e8f8f]" htmlFor="password">
              {d.password}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="mt-1 w-full rounded-[12px] border border-[#e7e7e7] bg-white px-3 py-2 text-sm outline-none focus:border-[#3629b7]"
            />
          </div>

          <div className="mt-2 flex gap-2">
            <button
              formAction={signIn}
              className="flex-1 rounded-[12px] bg-[#3629b7] px-3 py-2 text-sm font-medium text-white hover:bg-[#2d2296]"
            >
              {d.signIn}
            </button>
            <button
              formAction={signUp}
              className="flex-1 rounded-[12px] border border-[#e7e7e7] px-3 py-2 text-sm font-medium text-[#494949] hover:bg-[#f7f4f4]"
            >
              {d.signUp}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
