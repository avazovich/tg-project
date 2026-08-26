function Segment({
  label,
  value,
  share,
  color,
}: {
  label: string;
  value: string;
  share: number;
  color: string;
}) {
  return (
    <div className="flex-1">
      <div className="text-[11px] text-[#8e8f8f]">{label}</div>
      <div className="mt-0.5 text-lg font-semibold text-[#11263c]">{value}</div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#f2eeee]">
        <div className="h-full rounded-full" style={{ width: `${share}%`, background: color }} />
      </div>
    </div>
  );
}

/** Shows the placement breakdown — the thing no generic analytics tool gives you. */
export default function PlacementPreview() {
  return (
    <div className="rounded-[20px] border border-[#e7e3e3] bg-white p-5 shadow-[0_30px_70px_0_rgba(28,31,46,0.12)] md:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="font-medium text-[#11263c]">
          Crypto Uzbekistan
          <span className="ml-2 rounded-full bg-[#f4f2ff] px-2 py-0.5 text-xs font-medium text-[#3629b7]">
            1h/24h
          </span>
        </div>
        <div className="text-xs text-[#8e8f8f]">18 Aug 14:00 → 19 Aug 14:00</div>
      </div>

      <div className="mt-4 flex flex-wrap gap-5">
        <Segment label="Top slot (first 1h)" value="119" share={71} color="#3629b7" />
        <Segment label="Rest of feed window" value="38" share={23} color="#8b7fe8" />
        <Segment label="After window closed" value="10" share={6} color="#c9c4e8" />
      </div>

      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t border-[#f2eeee] pt-3 text-xs">
        <div className="flex gap-1.5">
          <dt className="text-[#8e8f8f]">Captured in top slot</dt>
          <dd className="font-medium text-[#494949]">76%</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="text-[#8e8f8f]">Still subscribed</dt>
          <dd className="font-medium text-[#494949]">
            104 <span className="text-[#b7b7b7]">(66%)</span>
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="text-[#8e8f8f]">Cost per window join</dt>
          <dd className="font-medium text-[#494949]">3.18</dd>
        </div>
      </dl>
    </div>
  );
}
