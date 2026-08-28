"use client";

import { useEffect, useRef, useState } from "react";
import { setActiveChannel } from "@/app/(app)/channel-actions";
import type { Channel } from "@/lib/account";

export default function ChannelSwitcher({
  channels,
  activeChannelId,
}: {
  channels: Channel[];
  activeChannelId: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = channels.find((c) => c.id === activeChannelId) ?? channels[0];
  const hasOthers = channels.length > 1;

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex w-full items-center gap-2 rounded-[12px] bg-[#f4f2ff] px-3 py-2.5 text-left transition-colors hover:bg-[#ebe7ff]"
      >
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-[#8e8f8f]">
            <span className="size-1.5 rounded-full bg-[#55a55e]" />
            Tracking
          </span>
          <span className="mt-0.5 block truncate text-sm font-medium text-[#3629b7]">
            {active.name}
          </span>
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className={`shrink-0 text-[#8e8f8f] transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M3.5 5.25L7 8.75l3.5-3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="animate-pop-in absolute left-0 right-0 top-full z-30 mt-1 origin-top overflow-hidden rounded-[12px] border border-[#efecec] bg-white shadow-[0_16px_32px_0_rgba(28,31,46,0.14)]"
        >
          {channels.map((ch) => {
            const isActive = ch.id === activeChannelId;
            return (
              <form
                key={ch.id}
                action={setActiveChannel}
                onSubmit={() => setOpen(false)}
                className="contents"
              >
                <input type="hidden" name="channelId" value={ch.id} />
                <button
                  type="submit"
                  disabled={isActive}
                  role="option"
                  aria-selected={isActive}
                  className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors ${
                    isActive
                      ? "cursor-default bg-[#f4f2ff] font-medium text-[#3629b7]"
                      : "text-[#494949] hover:bg-[#f7f4f4]"
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate">{ch.name}</span>
                  {isActive && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                      <path
                        d="M2.5 7.5l3 3 6-6.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </form>
            );
          })}

          {!hasOthers && (
            <p className="border-t border-[#f2eeee] px-3 py-2 text-xs text-[#8e8f8f]">
              Only one channel connected.
            </p>
          )}
          <a
            href="/onboarding"
            className="block border-t border-[#f2eeee] px-3 py-2.5 text-xs text-[#3629b7] hover:bg-[#f7f4f4]"
          >
            + Connect another channel
          </a>
        </div>
      )}
    </div>
  );
}
