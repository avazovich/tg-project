"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Wordmark from "./Wordmark";

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

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", Icon: DashboardIcon },
  { href: "/stats", label: "Stats", Icon: StatsIcon },
  { href: "/settings", label: "Settings", Icon: SettingsIcon },
];

export default function Sidebar({
  email,
  displayName,
  avatarUrl,
  activeChannelName,
}: {
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  activeChannelName: string;
}) {
  const pathname = usePathname();
  const name = displayName || email;

  return (
    <aside className="w-[248px] shrink-0 border-r border-[#efecec] flex flex-col justify-between py-[54px] px-10">
      <div>
        <Wordmark size="md" />

        <Link
          href="/profile"
          className="mt-7 block rounded-[12px] bg-[#f4f2ff] px-3 py-2.5 hover:bg-[#ebe7ff] transition-colors"
          title="Switch channel in Profile"
        >
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-[#8e8f8f]">
            <span className="size-1.5 rounded-full bg-[#55a55e]" />
            Tracking
          </div>
          <div className="mt-0.5 truncate text-sm font-medium text-[#3629b7]">
            {activeChannelName}
          </div>
        </Link>

        <nav className="mt-10">
          <div className="text-sm text-[#3629b7]">Menu</div>
          <div className="mt-[30px] flex flex-col gap-[30px]">
            {NAV_ITEMS.map(({ href, label, Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
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

      <Link href="/profile" className="flex items-center gap-2 group">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name}
            width={36}
            height={36}
            className="size-9 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="size-9 rounded-full bg-[#f4f2ff] flex items-center justify-center text-[#3629b7] text-sm font-medium shrink-0">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm text-[#494949] truncate group-hover:text-[#3629b7]">{name}</p>
          <p className="text-xs text-[#8e8f8f]">View profile</p>
        </div>
      </Link>
    </aside>
  );
}
