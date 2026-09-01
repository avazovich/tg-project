"use client";

import { usePathname } from "next/navigation";
import { LOCALES, LOCALE_LABEL, type Locale } from "@/i18n/config";
import { setLocale } from "@/i18n/actions";

export default function LanguageSwitcher({
  active,
  label,
  className = "",
}: {
  active: Locale;
  label: string;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <div
      role="group"
      aria-label={label}
      className={`inline-flex rounded-[10px] bg-[#f7f4f4] p-0.5 ${className}`}
    >
      {LOCALES.map((locale) => (
        <form key={locale} action={setLocale}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="next" value={pathname} />
          <button
            type="submit"
            disabled={locale === active}
            aria-current={locale === active ? "true" : undefined}
            className={`rounded-[8px] px-2.5 py-1 text-xs font-medium transition-colors ${
              locale === active
                ? "cursor-default bg-white text-[#3629b7] shadow-[0_1px_3px_0_rgba(28,31,46,0.12)]"
                : "text-[#8e8f8f] hover:text-[#3629b7]"
            }`}
          >
            {LOCALE_LABEL[locale]}
          </button>
        </form>
      ))}
    </div>
  );
}
