const TOP_VALUES = [15, 30, 60, 120, 180, 360, 720, 1440] as const;
const FEED_VALUES = [6, 12, 24, 48, 72, 168] as const;

type PlacementFieldsText = {
  postGoesLive: string;
  topSlot: string;
  inFeed: string;
  topOptions: Record<string, string>;
  feedOptions: Record<string, string>;
};

const inputClass =
  "mt-1 block rounded-[12px] border border-[#e7e7e7] bg-white px-3 py-2 text-sm outline-none focus:border-[#3629b7]";

// Renders a datetime-local value in the browser's local zone, which is what
// the input expects (it has no timezone of its own).
function toLocalInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function PlacementFields({
  idPrefix,
  promoStartsAt = null,
  topMinutes = null,
  feedHours = null,
  t,
}: {
  idPrefix: string;
  promoStartsAt?: string | null;
  topMinutes?: number | null;
  feedHours?: number | null;
  t: PlacementFieldsText;
}) {
  return (
    <>
      <div>
        <label className="text-xs text-[#8e8f8f]" htmlFor={`${idPrefix}-promoStartsAt`}>
          {t.postGoesLive}
        </label>
        <input
          id={`${idPrefix}-promoStartsAt`}
          name="promoStartsAt"
          type="datetime-local"
          defaultValue={toLocalInputValue(promoStartsAt)}
          className={inputClass}
        />
      </div>
      <div>
        <label className="text-xs text-[#8e8f8f]" htmlFor={`${idPrefix}-topMinutes`}>
          {t.topSlot}
        </label>
        <select
          id={`${idPrefix}-topMinutes`}
          name="topMinutes"
          defaultValue={topMinutes ?? 60}
          className={inputClass}
        >
          {TOP_VALUES.map((value) => (
            <option key={value} value={value}>
              {t.topOptions[String(value)]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs text-[#8e8f8f]" htmlFor={`${idPrefix}-feedHours`}>
          {t.inFeed}
        </label>
        <select
          id={`${idPrefix}-feedHours`}
          name="feedHours"
          defaultValue={feedHours ?? 24}
          className={inputClass}
        >
          {FEED_VALUES.map((value) => (
            <option key={value} value={value}>
              {t.feedOptions[String(value)]}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
