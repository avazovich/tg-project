-- Telegram ad buys are sold as placement windows, conventionally written
-- "1/24": the post sits as the channel's newest post ("top") for 1 hour, then
-- remains in the feed for 24 hours total before being removed.
--
-- Tracking these separately answers the question the buyer actually has:
-- was the premium for the top slot worth it, or did the joins arrive later
-- from the feed anyway?
alter table campaigns
  add column promo_starts_at timestamptz,
  add column top_minutes integer,
  add column feed_hours integer;

alter table campaigns
  add constraint campaigns_top_minutes_positive
    check (top_minutes is null or top_minutes > 0),
  add constraint campaigns_feed_hours_positive
    check (feed_hours is null or feed_hours > 0);
