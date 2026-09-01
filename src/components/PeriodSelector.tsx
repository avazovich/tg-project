import Link from "next/link";
import { PERIODS, type Period } from "@/lib/period";

/**
 * Plain query-param links rather than client-side state, so this works
 * identically on the Dashboard and inside the admin per-account view without
 * needing its own state management, and the selected period is shareable /
 * survives a reload.
 */
export default function PeriodSelector({
  active,
  basePath,
  extraParams = "",
  labels,
}: {
  active: Period;
  basePath: string;
  extraParams?: string;
  labels: Record<Period, string>;
}) {
  return (
    <div className="inline-flex rounded-[12px] bg-[#f7f4f4] p-1">
      {PERIODS.map((p) => {
        const isActive = p === active;
        return (
          <Link
            key={p}
            href={`${basePath}?period=${p}${extraParams}`}
            aria-current={isActive ? "true" : undefined}
            className={`rounded-[9px] px-3 py-1.5 text-xs font-medium transition-colors duration-150 sm:text-sm ${
              isActive
                ? "bg-white text-[#3629b7] shadow-[0_1px_3px_0_rgba(28,31,46,0.12)]"
                : "text-[#8e8f8f] hover:text-[#3629b7]"
            }`}
          >
            {labels[p]}
          </Link>
        );
      })}
    </div>
  );
}
