-- Phase 1: single-tenant, manually operated.
-- account_id is included on every table now so Phase 2 (multi-tenant auth + RLS)
-- only has to add policies, not migrate the schema.

create extension if not exists pgcrypto;

create table accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table channels (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id),
  telegram_chat_id bigint not null unique,
  name text not null,
  bot_status text not null default 'active' check (bot_status in ('active', 'removed', 'error')),
  created_at timestamptz not null default now()
);

create table campaigns (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id),
  channel_id uuid not null references channels(id),
  name text not null,
  source_category text not null check (source_category in ('paid_ad', 'influencer', 'organic', 'cross_promo', 'other')),
  budget numeric,
  invite_link_url text,
  status text not null default 'active' check (status in ('active', 'paused', 'archived')),
  created_at timestamptz not null default now()
);

-- Append-only source of truth. Retention is computed by querying this table,
-- never by mutating a separate "current subscribers" row.
create table member_events (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id),
  channel_id uuid not null references channels(id),
  telegram_user_id bigint not null,
  campaign_id uuid references campaigns(id), -- null = organic / no invite link
  event_type text not null check (event_type in ('joined', 'left', 'kicked')),
  event_timestamp timestamptz not null,
  telegram_update_id bigint not null unique, -- Telegram may retry delivery; this dedupes
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

create index member_events_channel_user_idx on member_events (channel_id, telegram_user_id);
create index member_events_campaign_idx on member_events (campaign_id);
create index member_events_timestamp_idx on member_events (event_timestamp);

-- Phase 1 default single-tenant account.
insert into accounts (name) values ('Default Account');
