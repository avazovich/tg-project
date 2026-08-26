"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/account";
import { createAdminClient } from "@/lib/supabase-admin";

export async function confirmChannel(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const channelId = String(formData.get("channelId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!channelId) redirect("/onboarding");

  if (name) {
    const admin = createAdminClient();
    // Ownership check: the channel must belong to this user's account.
    const { data: account } = await admin
      .from("accounts")
      .select("id")
      .eq("owner_user_id", user!.id)
      .single();
    await admin
      .from("channels")
      .update({ name })
      .eq("id", channelId)
      .eq("account_id", account?.id);
  }

  redirect("/dashboard");
}
