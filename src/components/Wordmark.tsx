const SIZES = {
  sm: "text-[22px]",
  md: "text-[28px]",
  lg: "text-[34px]",
} as const;

// Typographic mark: Outfit semibold, tightened tracking, and a subtle
// brand gradient. Deliberately not an image — it stays crisp at any size.
export default function Wordmark({ size = "md" }: { size?: keyof typeof SIZES }) {
  return (
    <span
      className={`inline-block bg-gradient-to-r from-[#3629b7] via-[#4b3fd6] to-[#1573ff] bg-clip-text font-semibold leading-none tracking-[-0.03em] text-transparent ${SIZES[size]}`}
      style={{ fontFamily: "var(--font-outfit)" }}
    >
      Foydami
    </span>
  );
}
