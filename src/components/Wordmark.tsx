import Image from "next/image";

const SIZES = {
  sm: { text: "text-[22px]", mark: 20, gap: "gap-1.5" },
  md: { text: "text-[28px]", mark: 26, gap: "gap-2" },
  lg: { text: "text-[34px]", mark: 32, gap: "gap-2.5" },
} as const;

/**
 * The Foydami lockup: the diverging-lines mark beside the wordmark.
 *
 * The word is live text in Outfit rather than part of the image, so it stays
 * crisp at any size and can be selected and read by assistive tech. The mark
 * is SVG for the same reason.
 */
export default function Wordmark({
  size = "md",
  showMark = true,
}: {
  size?: keyof typeof SIZES;
  showMark?: boolean;
}) {
  const s = SIZES[size];
  return (
    <span className={`inline-flex items-center ${s.gap}`}>
      {showMark && (
        <Image
          src="/mark.svg"
          alt=""
          width={s.mark}
          height={s.mark}
          className="shrink-0"
          priority
        />
      )}
      <span
        className={`bg-gradient-to-r from-[#3629b7] via-[#4b3fd6] to-[#1573ff] bg-clip-text font-semibold leading-none tracking-[-0.03em] text-transparent ${s.text}`}
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        Foydami
      </span>
    </span>
  );
}
