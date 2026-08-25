# Foydami

Telegram campaign ROI tracker. Answers one question: **which acquisition sources
produce subscribers who stay** — not just subscribers who join.

Each campaign gets its own generated Telegram invite link. When someone joins
through that link, Telegram tells us which link they used, so the join is
attributed to the campaign that earned it. From there the app computes retention
(1/7/30/90 day), churn, CAC, and cost per retained subscriber.

## Stack

- Next.js 16 (App Router) + Tailwind
- Supabase — Postgres, Auth, Storage, Edge Functions
- Telegram Bot API

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3200
```

Apply the database schema to a linked Supabase project:

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

Deploy the webhook and register it with Telegram:

```bash
npx supabase secrets set TELEGRAM_BOT_TOKEN=... TELEGRAM_WEBHOOK_SECRET=...
npx supabase functions deploy telegram-webhook

curl "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://<project-ref>.supabase.co/functions/v1/telegram-webhook" \
  -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>" \
  -d 'allowed_updates=["chat_member","my_chat_member","message"]'
```

## How attribution works

Telegram only includes an `invite_link` on a `chat_member` update when the user
actually joined through that link. Someone who finds the channel via search or the
public `t.me/<username>` link arrives with no link attached and is recorded as
**organic**. That is correct behaviour, not a gap — to attribute a join, the
campaign's generated link is the one that has to be shared.

Tracking is also real-time only: the bot sees joins from the moment it becomes a
channel admin onward. It cannot backfill a channel's history.

## Connecting a channel

Telegram webhooks have no idea which signed-in web user is acting, so onboarding
links the two identities:

1. The app issues a one-time claim code.
2. The user DMs the bot `/start <code>` — this reveals their Telegram user ID.
3. The user adds the bot as a channel admin — the resulting `my_chat_member`
   update carries that same user ID in its `from` field.

Matching on identity rather than timing means many people can onboard at once
without their channels being cross-linked.

## Data model

`member_events` is append-only and is the source of truth. Retention is always
computed by querying that log, never by mutating a running total, so the numbers
cannot silently drift. Duplicate webhook deliveries are deduped on
`telegram_update_id`.

Every table carries `account_id` and is protected by row-level security.

An account tracks **one active channel at a time**; switching is an explicit
action on the Profile page.
