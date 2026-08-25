import Image from "next/image";
import { requireOnboardedAccount } from "@/lib/account";
import { signOut } from "@/app/login/actions";
import { updateProfile } from "./actions";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { user, displayName, avatarUrl } = await requireOnboardedAccount();
  const { error } = await searchParams;
  const name = displayName || user.email || "";

  return (
    <main className="w-full px-5 py-8 md:px-[68px] md:py-[58px]">
      <h1 className="text-2xl font-semibold text-[#3629b7]">Profile</h1>
      <p className="mt-1 text-sm text-[#8e8f8f]">How you appear inside Foydami.</p>

      {error && (
        <p className="mt-4 max-w-2xl rounded-[12px] border border-[#ffd9c4] bg-[#fff2ec] px-3 py-2 text-sm text-[#ff4267]">
          {error}
        </p>
      )}

      <div className="mt-6 max-w-2xl rounded-[20px] border border-[#f2eeee] bg-white p-5 shadow-[0_20px_40px_0_rgba(0,0,0,0.03)] md:p-6">
        <form action={updateProfile} className="flex flex-col gap-5 sm:flex-row sm:items-start">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name}
              width={72}
              height={72}
              className="size-[72px] shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-[72px] shrink-0 items-center justify-center rounded-full bg-[#f4f2ff] text-2xl font-medium text-[#3629b7]">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
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

        <div className="mt-6 border-t border-[#f2eeee] pt-4 text-sm">
          <div className="flex flex-wrap justify-between gap-2 py-2">
            <span className="text-[#8e8f8f]">Email</span>
            <span className="font-medium text-[#11263c]">{user.email}</span>
          </div>
          <p className="text-xs text-[#b7b7b7]">
            Your email is tied to your login and can&apos;t be changed here.
          </p>
        </div>
      </div>

      <form action={signOut} className="mt-6">
        <button className="rounded-[12px] border border-[#e7e7e7] px-4 py-2 text-sm text-[#494949] hover:bg-[#f7f4f4]">
          Sign out
        </button>
      </form>
    </main>
  );
}
