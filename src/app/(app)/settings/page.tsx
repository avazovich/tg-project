import { requireOnboardedAccount } from "@/lib/account";

export const dynamic = "force-dynamic";

const BOT_STATUS_CLASS: Record<string, string> = {
  active: "bg-[#edffef] text-[#55a55e]",
  removed: "bg-[#fff2ec] text-[#ff4267]",
  error: "bg-[#fff2ec] text-[#ff4267]",
};

export default async function SettingsPage() {
  const { channels, activeChannel } = await requireOnboardedAccount();

  return (
    <main className="w-full py-[58px] px-[68px]">
      <h1 className="text-2xl text-[#3629b7] font-semibold">Settings</h1>
      <p className="mt-1 text-sm text-[#8e8f8f]">
        Bot connection status per channel. To change which channel Foydami is tracking, use{" "}
        <a href="/profile" className="text-[#3629b7] hover:underline">
          Profile
        </a>
        .
      </p>

      <div className="mt-8 max-w-3xl rounded-[20px] border border-[#f2eeee] bg-white p-6 shadow-[0_20px_40px_0_rgba(0,0,0,0.03)]">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-xs text-[#8e8f8f] border-b border-[#f2eeee]">
              <th className="py-2 pr-4 font-normal">Channel</th>
              <th className="py-2 pr-4 font-normal">Telegram chat ID</th>
              <th className="py-2 pr-4 font-normal">Bot status</th>
              <th className="py-2 pr-4 font-normal">Connected</th>
            </tr>
          </thead>
          <tbody>
            {channels.map((ch) => {
              const isActive = ch.id === activeChannel.id;
              return (
                <tr key={ch.id} className="border-b border-[#f7f4f4]">
                  <td className="py-3 pr-4 font-medium text-[#11263c]">
                    {ch.name}
                    {isActive && (
                      <span className="ml-2 rounded-full bg-[#f4f2ff] px-2 py-0.5 text-xs font-medium text-[#3629b7]">
                        active
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-[#8e8f8f]">{ch.telegram_chat_id}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        BOT_STATUS_CLASS[ch.bot_status] ?? "bg-[#f2eeee] text-[#8e8f8f]"
                      }`}
                    >
                      {ch.bot_status}
                    </span>
                    {ch.bot_status !== "active" && (
                      <a href="/onboarding" className="ml-2 text-xs text-[#3629b7] hover:underline">
                        reconnect
                      </a>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-[#8e8f8f]">
                    {new Date(ch.created_at).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <a
          href="/onboarding"
          className="mt-4 inline-block rounded-[12px] border border-[#e7e7e7] px-3 py-2 text-sm text-[#494949] hover:bg-[#f7f4f4]"
        >
          + Add another channel
        </a>
      </div>
    </main>
  );
}
