"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser, ensureAccount } from "@/lib/account";
import { createAdminClient } from "@/lib/supabase-admin";

export async function setActiveChannel(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const accountId = await ensureAccount(user!.id, user!.email);
  const admin = createAdminClient();

  const channelId = String(formData.get("channelId") ?? "");

  // Ownership check: the channel must belong to this user's account.
  const { data: channel } = await admin
    .from("channels")
    .select("id")
    .eq("id", channelId)
    .eq("account_id", accountId)
    .maybeSingle();
  if (!channel) return;

  await admin.from("accounts").update({ active_channel_id: channelId }).eq("id", accountId);

  // Revalidate rather than redirect, so switching keeps you on whatever page
  // you were already looking at — just repointed at the newly active channel.
  revalidatePath("/", "layout");
}
