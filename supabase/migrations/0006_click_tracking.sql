-- Click tracking is opt-in per campaign. A campaign with click_slug set has
-- a Foydami-hosted redirect link (/l/<slug>) that gets shared instead of the
-- raw Telegram invite link, so an open can be logged before the visitor is
-- forwarded on. Campaigns without a slug behave exactly as before —
-- Telegram's API has no concept of a "click" on an invite link at all, only
-- joins, so this is the only way to see the open itself.
alter table campaigns add column click_slug text unique;

-- Append-only, same shape as member_events, for the same reason: a click
-- count is a query over history, never a counter that can drift.
create table link_clicks (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id),
  clicked_at timestamptz not null default now()
);

create index link_clicks_campaign_idx on link_clicks (campaign_id);
