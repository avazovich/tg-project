import type { Metadata } from "next";
import { Poppins, Outfit } from "next/font/google";
import "./globals.css";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";

// Poppins has no Cyrillic subset on Google Fonts (only latin/latin-ext/
// devanagari) — Russian text in this font falls back to the platform's
// default sans-serif. That's a font limitation, not a missed setting.
const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

// Display face, used only for the Foydami wordmark — the brand name is
// never translated, so this never needs to render Cyrillic.
const outfit = Outfit({
  variable: "--font-outfit",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return {
    title: "Foydami",
    description: dict.meta.description,
    icons: { icon: "/mark.svg" },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${poppins.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-poppins)] bg-[#f2ede2]">
        {children}
      </body>
    </html>
  );
}
