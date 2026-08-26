"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Wordmark from "./Wordmark";
import ChannelSwitcher from "./ChannelSwitcher";
import type { Channel } from "@/lib/account";

function DashboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="1" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10" y="1" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="1" y="10" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10" y="10" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function StatsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 2v8l6 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="2.75" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.36 4.64l-1.41 1.41M6.05 13.95l-1.41 1.41M15.36 15.36l-1.41-1.41M6.05 6.05L4.64 4.64"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AdminIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 2.5l6 2.5v4.5c0 3.4-2.4 6.4-6 8-3.6-1.6-6-4.6-6-8V5l6-2.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", Icon: DashboardIcon },
  { href: "/stats", label: "Stats", Icon: StatsIcon },
  { href: "/settings", label: "Settings", Icon: SettingsIcon },
];

type Props = {
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  channels: Channel[];
  activeChannelId: string;
  isPlatformAdmin: boolean;
};

function SidebarBody({
  email,
  displayName,
  avatarUrl,
  channels,
  activeChannelId,
  isPlatformAdmin,
  onNavigate,
}: Props & { onNavigate?: () => void }) {
  const pathname = usePathname();
  const name = displayName || email;
  // Hiding the link is cosmetic; /admin enforces access server-side.
  const navItems = isPlatformAdmin
    ? [...NAV_ITEMS, { href: "/admin", label: "Admin", Icon: AdminIcon }]
    : NAV_ITEMS;

  return (
    <>
      <div>
        <Wordmark size="md" />

        <div className="mt-7">
          <ChannelSwitcher channels={channels} activeChannelId={activeChannelId} />
        </div>

        <nav className="mt-10">
          <div className="text-sm text-[#3629b7]">Menu</div>
          <div className="mt-[30px] flex flex-col gap-[30px]">
            {navItems.map(({ href, label, Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  className={`flex items-center gap-[18px] text-sm transition-colors ${
                    active ? "text-[#3629b7] font-medium" : "text-[#838383] hover:text-[#3629b7]"
                  }`}
                >
                  <Icon />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      <Link
        href="/profile"
        onClick={onNavigate}
        className="group flex items-center gap-2 rounded-[12px] p-2 -m-2 hover:bg-[#f7f4f4]"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name}
            width={36}
            height={36}
            className="size-9 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f4f2ff] text-sm font-medium text-[#3629b7]">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm text-[#494949] group-hover:text-[#3629b7]">{name}</p>
          <p className="text-xs text-[#8e8f8f]">View profile</p>
        </div>
      </Link>
    </>
  );
}

export default function Sidebar(props: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile: top bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#efecec] px-5 py-4 lg:hidden">
        <Wordmark size="sm" />
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="rounded-[10px] p-2 text-[#494949] hover:bg-[#f7f4f4]"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path
              d="M3 6h16M3 11h16M3 16h16"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Mobile: slide-in drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/25"
          />
          <aside className="absolute inset-y-0 left-0 flex w-[270px] max-w-[85vw] flex-col justify-between overflow-y-auto bg-white px-7 py-8 shadow-xl">
            <SidebarBody {...props} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Desktop: fixed rail that never scrolls with the content */}
      <aside className="hidden w-[248px] shrink-0 flex-col justify-between overflow-y-auto border-r border-[#efecec] px-10 py-[54px] lg:flex">
        <SidebarBody {...props} />
      </aside>
    </>
  );
}
