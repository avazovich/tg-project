import GrowthChart from "@/components/GrowthChart";
import RetentionDonut from "@/components/RetentionDonut";
import type { PeriodPoint } from "@/lib/dashboard-data";

// Deterministic sample series — no randomness, so the server and client render
// identically and the page looks the same on every visit.
const SHAPE = [
  4, 6, 3, 9, 14, 11, 7, 5, 8, 22, 31, 18, 12, 9, 7, 6, 10, 27, 41, 33, 21, 15,
  11, 9, 8, 13, 24, 19, 14, 17,
];

const sampleSeries: PeriodPoint[] = SHAPE.map((joined, i) => {
  const left = Math.max(1, Math.round(joined * (i % 5 === 0 ? 0.5 : 0.22)));
  const d = new Date(Date.UTC(2026, 6, 1 + i));
  return { bucketStart: d.toISOString(), joined, left, net: joined - left };
});

const TINTS = {
  green: { bg: "#edffef", fg: "#55a55e", ring: "#c7f2cb" },
  purple: { bg: "#f4f2ff", fg: "#5e5498", ring: "#dcd6ff" },
  orange: { bg: "#fff2ec", fg: "#9b715d", ring: "#ffd9c4" },
  blue: { bg: "#eaf3ff", fg: "#1d5fa8", ring: "#bfe0ff" },
} as const;

function MiniStat({
  label,
  value,
  tint,
}: {
  label: string;
  value: string;
  tint: keyof typeof TINTS;
}) {
  const c = TINTS[tint];
  return (
    <div className="rounded-[12px] px-3 py-2.5 sm:px-4 sm:py-3" style={{ background: c.bg }}>
      <div className="text-[10px] sm:text-xs" style={{ color: c.fg }}>
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-[#11263c] sm:text-lg">{value}</div>
    </div>
  );
}

type PreviewText = {
  welcomeBack: string;
  sampleName: string;
  activeSubscribers: string;
  joined30: string;
  left30: string;
  netGrowth30: string;
  growthLast30: string;
  sevenDayRetention: string;
  joinsRetained: string;
  urlBar: string;
};

/** A framed, live rendering of the real dashboard — same components, sample data. */
export default function ProductPreview({ t, intlLocale }: { t: PreviewText; intlLocale: string }) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-[#e7e3e3] bg-white shadow-[0_30px_70px_0_rgba(28,31,46,0.16)]">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-[#f2eeee] bg-[#faf8f8] px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 truncate rounded-md bg-white px-2 py-0.5 text-[10px] text-[#b7b7b7]">
          {t.urlBar}
        </span>
      </div>

      <div className="flex">
        {/* sidebar suggestion */}
        <div className="hidden w-[128px] shrink-0 flex-col gap-2 border-r border-[#f2eeee] p-4 sm:flex">
          <div className="h-2.5 w-16 rounded-full bg-[#e3dff5]" />
          <div className="mt-3 rounded-[8px] bg-[#f4f2ff] px-2 py-1.5">
            <div className="h-1.5 w-8 rounded-full bg-[#cdc6ee]" />
            <div className="mt-1 h-2 w-16 rounded-full bg-[#a99fe0]" />
          </div>
          <div className="mt-3 h-2 w-14 rounded-full bg-[#3629b7]/70" />
          <div className="h-2 w-12 rounded-full bg-[#eae6e6]" />
          <div className="h-2 w-16 rounded-full bg-[#eae6e6]" />
        </div>

        <div className="min-w-0 flex-1 p-4 sm:p-5">
          <div className="text-xs text-[#3629b7] sm:text-sm">
            {t.welcomeBack} <span className="font-semibold">{t.sampleName}</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
            <MiniStat label={t.activeSubscribers} value="12,480" tint="green" />
            <MiniStat label={t.joined30} value="+438" tint="purple" />
            <MiniStat label={t.left30} value="−112" tint="orange" />
            <MiniStat label={t.netGrowth30} value="+326" tint="blue" />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="rounded-[12px] border border-[#f2eeee] p-3 lg:col-span-2">
              <div className="text-[11px] font-medium text-[#494949] sm:text-xs">
                {t.growthLast30}
              </div>
              <div className="mt-1">
                <GrowthChart data={sampleSeries} intlLocale={intlLocale} />
              </div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-[12px] border border-[#f2eeee] p-3">
              <div className="self-start text-[11px] font-medium text-[#494949] sm:text-xs">
                {t.sevenDayRetention}
              </div>
              <div className="mt-2">
                <RetentionDonut pct={74} />
              </div>
              <div className="mt-1 text-[10px] text-[#8e8f8f]">{t.joinsRetained}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
