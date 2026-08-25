import type { Metadata } from "next";
import { Poppins, Outfit } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

// Display face, used only for the Foydami wordmark.
const outfit = Outfit({
  variable: "--font-outfit",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Foydami",
  description: "Which sources produce subscribers who stay.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-poppins)] bg-[#f2ede2]">
        {children}
      </body>
    </html>
  );
}
