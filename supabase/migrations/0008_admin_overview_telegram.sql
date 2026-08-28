-- Surfaces telegram_username on the admin overview so Telegram-only accounts
-- (which have no real email) show a readable identity in the admin panel
-- instead of the internal synthetic address.
create or replace view admin_account_overview
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
     where me.account_id = a.id)                         as last_event_at,
  a.telegram_username
from accounts a;
