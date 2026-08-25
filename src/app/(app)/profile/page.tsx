import Image from "next/image";
import { requireOnboardedAccount } from "@/lib/account";
import { signOut } from "@/app/login/actions";
import { updateProfile } from "./actions";
import { setActiveChannel } from "./channel-actions";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { user, channels, activeChannel, displayName, avatarUrl } =
    await requireOnboardedAccount();
  const { error } = await searchParams;
  const name = displayName || user.email || "";

  return (
    <main className="w-full py-[58px] px-[68px]">
      <h1 className="text-2xl text-[#3629b7] font-semibold">Profile</h1>

      {error && (
        <p className="mt-4 max-w-2xl rounded-[12px] border border-[#ffd9c4] bg-[#fff2ec] px-3 py-2 text-sm text-[#ff4267]">
          {error}
        </p>
      )}

      <div className="mt-8 max-w-2xl rounded-[20px] border border-[#f2eeee] bg-white p-6 shadow-[0_20px_40px_0_rgba(0,0,0,0.03)]">
        <form action={updateProfile} className="flex items-center gap-5">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name}
              width={72}
              height={72}
              className="size-[72px] rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="size-[72px] rounded-full bg-[#f4f2ff] flex items-center justify-center text-[#3629b7] text-2xl font-medium shrink-0">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <label className="text-xs text-[#8e8f8f]" htmlFor="displayName">
              Display name
            </label>
            <input
              id="displayName"
              name="displayName"
              defaultValue={displayName ?? ""}
              placeholder={user.email}
              className="mt-1 block w-full rounded-[12px] border border-[#e7e7e7] bg-white px-3 py-2 text-sm outline-none focus:border-[#3629b7]"
            />
            <label className="mt-3 block text-xs text-[#8e8f8f]" htmlFor="avatar">
              Photo (PNG, JPEG, or WebP, under 5MB)
            </label>
            <input
              id="avatar"
              name="avatar"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="mt-1 block w-full text-sm text-[#494949] file:mr-3 file:rounded-[8px] file:border-0 file:bg-[#f4f2ff] file:px-3 file:py-1.5 file:text-xs file:text-[#3629b7]"
            />
            <button
              type="submit"
              className="mt-3 rounded-[12px] bg-[#3629b7] px-4 py-2 text-sm font-medium text-white hover:bg-[#2d2296]"
            >
              Save
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-[#f2eeee] text-sm">
          <div className="flex justify-between py-2">
            <span className="text-[#8e8f8f]">Email</span>
            <span className="text-[#11263c] font-medium">{user.email}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 max-w-2xl rounded-[20px] border border-[#f2eeee] bg-white p-6 shadow-[0_20px_40px_0_rgba(0,0,0,0.03)]">
        <div className="text-base font-medium text-[#494949]">Active channel</div>
        <p className="mt-0.5 text-xs text-[#8e8f8f]">
          Foydami tracks one channel at a time. Everything on the Dashboard and Stats pages refers
          to whichever is selected here.
        </p>

        <div className="mt-4 flex flex-col gap-2">
          {channels.map((ch) => {
            const isActive = ch.id === activeChannel.id;
            return (
              <div
                key={ch.id}
                className={`flex items-center justify-between rounded-[12px] px-4 py-3 ${
                  isActive ? "bg-[#f4f2ff] ring-1 ring-[#dcd6ff]" : "bg-[#f7f4f4]"
                }`}
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-[#11263c]">{ch.name}</div>
                  <div className="text-xs text-[#8e8f8f]">
                    {ch.bot_status === "active" ? "Bot connected" : `Bot ${ch.bot_status}`}
                  </div>
                </div>
                {isActive ? (
                  <span className="shrink-0 rounded-full bg-[#3629b7] px-2.5 py-0.5 text-xs font-medium text-white">
                    Tracking
                  </span>
                ) : (
                  <form action={setActiveChannel} className="shrink-0">
                    <input type="hidden" name="channelId" value={ch.id} />
                    <button className="rounded-[10px] border border-[#e7e7e7] bg-white px-3 py-1.5 text-xs font-medium text-[#3629b7] hover:bg-[#f4f2ff]">
                      Switch to this
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>

        <a
          href="/onboarding"
          className="mt-4 inline-block rounded-[12px] border border-[#e7e7e7] px-3 py-2 text-sm text-[#494949] hover:bg-[#f7f4f4]"
        >
          + Connect another channel
        </a>
      </div>

      <form action={signOut} className="mt-6">
        <button className="rounded-[12px] border border-[#e7e7e7] px-4 py-2 text-sm text-[#494949] hover:bg-[#f7f4f4]">
          Sign out
        </button>
      </form>
    </main>
  );
}
