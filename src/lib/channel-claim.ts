import "server-only";
import { randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase-admin";

export type PendingClaim = {
  id: string;
  account_id: string;
  claim_code: string;
  telegram_user_id: number | null;
  claimed_channel_id: string | null;
  expires_at: string;
};

// Reuses an unexpired, unclaimed claim if one exists — avoids piling up
// dead codes every time the onboarding page reloads.
export async function getOrCreateClaim(accountId: string): Promise<PendingClaim> {
  const admin = createAdminClient();

  const { data: existing, error: lookupError } = await admin
    .from("pending_channel_claims")
    .select("*")
    .eq("account_id", accountId)
    .is("claimed_channel_id", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) return existing;

  const claimCode = randomBytes(6).toString("hex");
  const { data: created, error: insertError } = await admin
    .from("pending_channel_claims")
    .insert({ account_id: accountId, claim_code: claimCode })
    .select("*")
    .single();
  if (insertError) throw insertError;
  return created;
}
