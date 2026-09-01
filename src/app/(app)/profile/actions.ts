"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser, ensureAccount } from "@/lib/account";
import { createAdminClient } from "@/lib/supabase-admin";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionary";

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

export async function updateProfile(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const accountId = await ensureAccount(user!.id, user!.email);
  const admin = createAdminClient();

  const displayName = String(formData.get("displayName") ?? "").trim();
  const avatar = formData.get("avatar");

  const updates: Record<string, string> = {};
  if (displayName) updates.display_name = displayName;

  if (avatar instanceof File && avatar.size > 0) {
    if (!ALLOWED_TYPES.has(avatar.type)) {
      const dict = await getDictionary(await getLocale());
      redirect("/profile?error=" + encodeURIComponent(dict.errors.profile.badImageType));
    }
    if (avatar.size > MAX_BYTES) {
      const dict = await getDictionary(await getLocale());
      redirect("/profile?error=" + encodeURIComponent(dict.errors.profile.imageTooLarge));
    }

    const ext = avatar.type.split("/")[1];
    const path = `${accountId}/avatar.${ext}`;

    const { error: uploadError } = await admin.storage
      .from("avatars")
      .upload(path, avatar, { upsert: true, contentType: avatar.type });
    if (uploadError) throw uploadError;

    const { data: publicUrl } = admin.storage.from("avatars").getPublicUrl(path);
    // Cache-bust so the new photo shows immediately instead of a stale CDN copy.
    updates.avatar_url = `${publicUrl.publicUrl}?v=${Date.now()}`;
  }

  if (Object.keys(updates).length > 0) {
    await admin.from("accounts").update(updates).eq("id", accountId);
  }

  revalidatePath("/", "layout");
  redirect("/profile");
}
