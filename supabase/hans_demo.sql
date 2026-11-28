-- Hans demo (AluPlast Demo, university project). Run once in the Supabase SQL editor.
-- RLS is enabled with NO policies: only the server (service-role key) can read or write these tables.

create table if not exists public.hans_chats (
  id          text primary key,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  outcome     text not null default 'open',          -- open | quoted | offer_emailed | appointment | handoff
  turns       integer not null default 0,            -- customer messages (also used as optimistic lock)
  messages    jsonb not null default '[]'::jsonb,    -- full model conversation (append-only)
  state       jsonb not null default '{}'::jsonb,    -- quotes, e-mails, appointments, hand-offs, contact
  transcript  jsonb not null default '[]'::jsonb,    -- what the customer saw
  usage       jsonb not null default '{}'::jsonb,    -- token usage (for the cost analysis)
  log         jsonb not null default '[]'::jsonb     -- tool calls + policy-checker results per turn
);

create table if not exists public.hans_appointments (
  kind        text not null check (kind in ('call', 'consultation')),
  slot        text not null,                         -- 'YYYY-MM-DD HH:MM' Europe/Sofia
  chat_id     text references public.hans_chats(id) on delete cascade,
  name        text,
  phone       text,
  address     text,
  created_at  timestamptz not null default now(),
  primary key (kind, slot)                           -- a slot can be booked once
);

create table if not exists public.hans_feedback (
  id          bigserial primary key,
  chat_id     text references public.hans_chats(id) on delete cascade,
  rating      text not null check (rating in ('up', 'down')),
  comment     text,
  outcome     text,
  created_at  timestamptz not null default now()
);

create index if not exists hans_chats_created_idx on public.hans_chats (created_at desc);

alter table public.hans_chats        enable row level security;
alter table public.hans_appointments enable row level security;
alter table public.hans_feedback     enable row level security;

-- Retention: conversations (and, via ON DELETE CASCADE, their feedback and appointments) are kept for 2 years.
-- Needs the pg_cron extension (Supabase: Database → Extensions → pg_cron). Runs daily at 03:17 UTC.
create or replace function public.hans_purge_old() returns void language sql security definer set search_path = public as $$
  delete from public.hans_chats where created_at < now() - interval '2 years';
$$;
revoke all on function public.hans_purge_old() from public, anon, authenticated;
-- select cron.schedule('hans-purge-2y', '17 3 * * *', 'select public.hans_purge_old()');
