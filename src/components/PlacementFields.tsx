const TOP_OPTIONS = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 60, label: "1 hour" },
  { value: 120, label: "2 hours" },
  { value: 180, label: "3 hours" },
  { value: 360, label: "6 hours" },
  { value: 720, label: "12 hours" },
  { value: 1440, label: "24 hours" },
];

const FEED_OPTIONS = [
  { value: 6, label: "6 hours" },
  { value: 12, label: "12 hours" },
  { value: 24, label: "24 hours" },
  { value: 48, label: "48 hours" },
  { value: 72, label: "3 days" },
  { value: 168, label: "1 week" },
];

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
}: {
  idPrefix: string;
  promoStartsAt?: string | null;
  topMinutes?: number | null;
  feedHours?: number | null;
}) {
  return (
    <>
      <div>
        <label className="text-xs text-[#8e8f8f]" htmlFor={`${idPrefix}-promoStartsAt`}>
          Post goes live
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
          Top slot
        </label>
        <select
          id={`${idPrefix}-topMinutes`}
          name="topMinutes"
          defaultValue={topMinutes ?? 60}
          className={inputClass}
        >
          {TOP_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs text-[#8e8f8f]" htmlFor={`${idPrefix}-feedHours`}>
          In feed
        </label>
        <select
          id={`${idPrefix}-feedHours`}
          name="feedHours"
          defaultValue={feedHours ?? 24}
          className={inputClass}
        >
          {FEED_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
