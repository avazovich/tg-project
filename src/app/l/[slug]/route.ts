import { createAdminClient } from "@/lib/supabase-admin";
import { isLikelyLinkPreviewBot } from "@/lib/click-tracking";
import { resolveLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";

export const dynamic = "force-dynamic";

/**
 * The tracked link a campaign actually shares, when click tracking is on.
 * Logs the open, then forwards to the real Telegram invite link. This is
 * the only point in the whole system that ever sees a "click" — Telegram's
 * own API has no concept of one, only joins.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const admin = createAdminClient();

  const { data: campaign } = await admin
    .from("campaigns")
    .select("id, invite_link_url")
    .eq("click_slug", slug)
    .maybeSingle();

  if (!campaign?.invite_link_url) {
    // No auth proxy runs on this path (see proxy.ts), so there's no locale
    // cookie to read — this is ad traffic, not app browsing. Fall back
    // directly to the browser's own language list instead.
    const locale = resolveLocale(request.headers.get("accept-language"));
    const dict = await getDictionary(locale);
    return new Response(dict.errors.linkInvalid, { status: 404 });
  }

  const userAgent = request.headers.get("user-agent");
  if (!isLikelyLinkPreviewBot(userAgent)) {
    // Best-effort: a failed insert here should never block someone from
    // reaching the channel — losing one click datapoint is a far smaller
    // problem than a dead link in a live ad.
    const { error } = await admin
      .from("link_clicks")
      .insert({ campaign_id: campaign.id });
    if (error) console.error("link_clicks insert failed:", error.message);
  }

  return Response.redirect(campaign.invite_link_url, 302);
}
