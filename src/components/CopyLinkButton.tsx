"use client";

import { useState } from "react";

export default function CopyLinkButton({
  url,
  copyLabel,
  copiedLabel,
}: {
  url: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // Clipboard blocked (insecure context or denied permission) — the
          // link is still visible next to this button to copy manually.
        }
      }}
      className="shrink-0 rounded-[8px] border border-[#e7e7e7] px-2 py-0.5 text-xs text-[#8e8f8f] hover:bg-[#f7f4f4] hover:text-[#3629b7]"
    >
      {copied ? copiedLabel : copyLabel}
    </button>
  );
}
