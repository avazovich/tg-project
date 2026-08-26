import Link from "next/link";
import type { Metadata } from "next";
import Wordmark from "@/components/Wordmark";
import ProductPreview from "@/components/landing/ProductPreview";
import PlacementPreview from "@/components/landing/PlacementPreview";

export const metadata: Metadata = {
  title: "Foydami — which Telegram ads bring subscribers who stay",
  description:
    "Track every Telegram channel campaign back to the ad that earned it. Retention, churn and cost per retained subscriber — not just raw join counts.",
};

function Feature({
  title,
  body,
  icon,
}: {
  title: string;
  body: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[20px] border border-[#f2eeee] bg-white p-6">
      <div className="flex size-11 items-center justify-center rounded-full bg-[#f4f2ff] text-[#3629b7]">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold text-[#11263c]">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-[#8e8f8f]">{body}</p>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#3629b7] text-sm font-semibold text-white">
        {n}
      </div>
      <div>
        <h3 className="font-medium text-[#11263c]">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-[#8e8f8f]">{body}</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="flex-1">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 md:px-8">
        <Wordmark size="sm" />
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="rounded-[12px] px-3 py-2 text-sm text-[#494949] hover:text-[#3629b7]"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="rounded-[12px] bg-[#3629b7] px-4 py-2 text-sm font-medium text-white hover:bg-[#2d2296]"
          >
            Get started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto w-full max-w-6xl px-5 pt-8 pb-4 md:px-8 md:pt-16">
        <div className="max-w-3xl">
          <span className="inline-block rounded-full bg-[#f4f2ff] px-3 py-1 text-xs font-medium text-[#3629b7]">
            For Telegram channel owners &amp; agencies
          </span>
          <h1 className="mt-5 text-[34px] font-semibold leading-[1.1] tracking-[-0.02em] text-[#11263c] sm:text-[46px] md:text-[56px]">
            Know which ads bring subscribers who{" "}
            <span className="bg-gradient-to-r from-[#3629b7] to-[#1573ff] bg-clip-text text-transparent">
              actually stay
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#6f7076] sm:text-lg">
            Telegram tells you a thousand people joined. It won&apos;t tell you that eight hundred
            left within a week, or which ad they came from. Foydami traces every join back to the
            campaign that earned it, then follows whether those people stick around.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/login"
              className="rounded-[12px] bg-[#3629b7] px-6 py-3 text-sm font-medium text-white hover:bg-[#2d2296]"
            >
              Start tracking free
            </Link>
            <span className="text-sm text-[#8e8f8f]">
              Connect a channel in two steps — no code.
            </span>
          </div>
        </div>

        <div className="mt-12 md:mt-16">
          <ProductPreview />
        </div>
      </section>

      {/* The problem */}
      <section className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <h2 className="max-w-2xl text-[26px] font-semibold leading-tight tracking-[-0.02em] text-[#11263c] sm:text-[34px]">
          Subscriber counts hide the expensive truth
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#6f7076]">
          Two ads deliver 500 subscribers each for the same price. Six weeks later one has 400 left
          and the other has 90. On raw numbers they looked identical.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          <Feature
            title="Real attribution, not guesswork"
            body="Every campaign gets its own generated Telegram invite link. When someone joins through it, that join belongs to that ad — no UTM guessing, no asking the channel owner to count for you."
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M8 12l4-4M7.5 5.5l1-1a3.5 3.5 0 015 5l-1 1M12.5 14.5l-1 1a3.5 3.5 0 01-5-5l1-1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            }
          />
          <Feature
            title="Retention over 1, 7, 30 and 90 days"
            body="See how many of an ad's subscribers are still there a week and a month later — and the churn rate that raw join counts quietly hide."
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M3 14l4-4 3 3 6-7"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />
          <Feature
            title="Cost per subscriber who stayed"
            body="Enter what the ad cost and get CAC alongside cost per retained subscriber. The second number is the one that decides whether to buy again."
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M10 6v8M12.2 7.8a2.4 2.4 0 00-4.4 1.3c0 2.3 4.4 1.2 4.4 3.3a2.4 2.4 0 01-4.4-1.2"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            }
          />
        </div>
      </section>

      {/* Placement windows */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-5 md:px-8 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="inline-block rounded-full bg-[#edffef] px-3 py-1 text-xs font-medium text-[#55a55e]">
              Built for how Telegram ads are actually sold
            </span>
            <h2 className="mt-5 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-[#11263c] sm:text-[34px]">
              Was the top slot worth the premium?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#6f7076]">
              You buy &ldquo;1/24&rdquo; — an hour pinned at the top, then a day in the feed. You
              pay extra for that first hour. Foydami splits joins across the top slot, the rest of
              the feed window, and after the post came down.
            </p>
            <p className="mt-3 text-base leading-relaxed text-[#6f7076]">
              If most joins arrive in the first hour, the premium earned its price. If they trickle
              in later, you were paying for something the feed gave you anyway.
            </p>
          </div>
          <PlacementPreview />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <h2 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-[#11263c] sm:text-[34px]">
          Running in a few minutes
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
          <Step
            n="1"
            title="Add the bot to your channel"
            body="Message the bot, then add it as an admin. It confirms the moment it's connected and starts recording joins and leaves."
          />
          <Step
            n="2"
            title="Create a campaign"
            body="Name the placement and enter what it cost. Foydami generates a dedicated Telegram invite link — share that instead of your public link."
          />
          <Step
            n="3"
            title="Watch who stays"
            body="Joins are attributed automatically. Retention, churn and cost per retained subscriber build up as time passes."
          />
        </div>

        <div className="mt-10 rounded-[16px] border border-[#f2eeee] bg-white p-5">
          <p className="text-sm leading-relaxed text-[#6f7076]">
            <span className="font-medium text-[#11263c]">One honest limitation:</span> tracking
            starts when the bot becomes an admin. Telegram gives no way to recover a channel&apos;s
            history, so the sooner it&apos;s connected, the sooner the numbers mean something.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-6xl px-5 pb-20 md:px-8">
        <div className="rounded-[24px] bg-[#3629b7] px-6 py-12 text-center md:px-12 md:py-16">
          <h2 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-white sm:text-[34px]">
            Stop paying twice for subscribers who leave
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-[#c9c4ee]">
            Connect a channel and your next campaign will tell you whether it was worth buying
            again.
          </p>
          <Link
            href="/login"
            className="mt-7 inline-block rounded-[12px] bg-white px-6 py-3 text-sm font-medium text-[#3629b7] hover:bg-[#f4f2ff]"
          >
            Start tracking free
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#e5e0d6]">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 md:px-8">
          <Wordmark size="sm" />
          <p className="text-xs text-[#8e8f8f]">
            Foydami — Telegram campaign ROI tracking.
          </p>
        </div>
      </footer>
    </div>
  );
}
