-- Phase 2: multi-tenant auth.
-- One owner per account for now (team members explicitly deferred per spec).
alter table accounts add column owner_user_id uuid references auth.users(id) unique;

-- Telegram's webhook has no concept of "which web app user did this."
-- To attribute a newly-added channel to the right account, the onboarding
-- flow issues a claim_code, the user DMs the bot "/start <claim_code>"
-- (which tells us their telegram_user_id), then adds the bot as admin to
-- their channel (which tells us, via my_chat_member's `from` field, that
-- the same telegram_user_id performed the promotion) — linking the two.
create table pending_channel_claims (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id),
  claim_code text not null unique,
  telegram_user_id bigint,
  claimed_channel_id uuid references channels(id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '1 hour'
);

alter table pending_channel_claims enable row level security;

-- Read-only for authenticated users. All writes (account creation, claim
-- creation, campaign creation, etc.) go through Server Actions using the
-- admin client after an explicit ownership check in code — not client-side
-- inserts — so no INSERT/UPDATE policies are needed here.
create policy "Owner can read their account" on accounts
  for select using (owner_user_id = auth.uid());

create policy "Owner can read their channels" on channels
  for select using (
    account_id in (select id from accounts where owner_user_id = auth.uid())
  );

create policy "Owner can read their campaigns" on campaigns
  for select using (
    account_id in (select id from accounts where owner_user_id = auth.uid())
  );

create policy "Owner can read their member events" on member_events
  for select using (
    account_id in (select id from accounts where owner_user_id = auth.uid())
  );

create policy "Owner can read their claims" on pending_channel_claims
  for select using (
    account_id in (select id from accounts where owner_user_id = auth.uid())
  );
