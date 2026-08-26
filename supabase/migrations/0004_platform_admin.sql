-- Platform-operator access. Distinct from account ownership: this is "can see
-- the whole business", not "owns this channel".
alter table accounts add column is_platform_admin boolean not null default false;

-- Per-account rollup computed in Postgres rather than by pulling every
-- member_event into the app, so the admin page stays cheap as accounts grow.
-- security_invoker keeps RLS in force for ordinary callers; the admin page
-- reads it with the service key, which bypasses RLS by design.
create view admin_account_overview
with (security_invoker = true) as
select
  a.id                as account_id,
  a.owner_user_id,
  a.display_name,
  a.created_at,
  a.is_platform_admin,
  (select count(*) from channels c
     where c.account_id = a.id)                          as channel_count,
  (select count(*) from channels c
     where c.account_id = a.id and c.bot_status <> 'active') as broken_channel_count,
  (select count(*) from campaigns cp
     where cp.account_id = a.id)                         as campaign_count,
  (select count(*) from member_events me
     where me.account_id = a.id and me.event_type = 'joined') as joins_tracked,
  (select count(*) from member_events me
     where me.account_id = a.id
       and me.event_type = 'joined'
       and me.campaign_id is not null)                   as attributed_joins,
  (select max(me.event_timestamp) from member_events me
     where me.account_id = a.id)                         as last_event_at
from accounts a;
