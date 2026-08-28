-- Telegram-based sign-in: makes email/password fully optional. A user can
-- create or return to an account entirely through a bot-issued pairing code
-- typed back into the web app — no email ever entered by the user. The
-- account still lives in Supabase Auth behind a synthetic, never-shown
-- email (see verifyTelegramCode), so every existing session/RLS/admin path
-- keeps working unchanged — only how the session gets minted differs.
alter table accounts add column telegram_user_id bigint unique;
alter table accounts add column telegram_username text;

create table telegram_login_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  telegram_user_id bigint not null,
  telegram_username text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '10 minutes',
  consumed_at timestamptz
);

alter table telegram_login_codes enable row level security;
-- No policies: only ever read/written by the server via the admin client
-- (which bypasses RLS), during the brief pairing handshake. A client-side
-- session has no legitimate reason to see anyone's pending login codes.
