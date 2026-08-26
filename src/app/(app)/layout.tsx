import { requireOnboardedAccount } from "@/lib/account";
import Sidebar from "@/components/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, displayName, avatarUrl, channels, activeChannel, isPlatformAdmin } =
    await requireOnboardedAccount();

  return (
    <div className="flex flex-1 items-stretch justify-center p-0 sm:p-6">
      {/* Height is pinned to the viewport so the sidebar stays put and only
          the content column scrolls. */}
      <div className="flex h-[100dvh] w-full max-w-[1440px] flex-col overflow-hidden bg-white text-[#494949] sm:h-[calc(100dvh-48px)] sm:rounded-[24px] sm:shadow-[0_40px_80px_0_rgba(28,31,46,0.12)] lg:flex-row">
        <Sidebar
          email={user.email ?? ""}
          displayName={displayName}
          avatarUrl={avatarUrl}
          channels={channels}
          activeChannelId={activeChannel.id}
          isPlatformAdmin={isPlatformAdmin}
        />
        <div className="min-w-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
