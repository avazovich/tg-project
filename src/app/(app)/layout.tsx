import { requireOnboardedAccount } from "@/lib/account";
import Sidebar from "@/components/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, displayName, avatarUrl, activeChannel } = await requireOnboardedAccount();

  return (
    <div className="flex flex-1 items-stretch justify-center p-6">
      <div className="flex w-full max-w-[1440px] overflow-hidden rounded-[24px] bg-white shadow-[0_40px_80px_0_rgba(28,31,46,0.12)] text-[#494949]">
        <Sidebar
          email={user.email ?? ""}
          displayName={displayName}
          avatarUrl={avatarUrl}
          activeChannelName={activeChannel.name}
        />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
