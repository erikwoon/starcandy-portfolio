-- Options Trading Tracker — initial schema
-- Run in the Supabase SQL editor, or via `supabase db push`.

create table if not exists trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) default auth.uid(),
  ticker text not null,
  type text not null check (type in ('Call', 'Put')),
  strategy text not null,
  strike text,
  expiry date,
  qty integer not null default 1,
  premium numeric not null default 0,
  status text not null check (status in ('Open', 'Closed')) default 'Open',
  pnl numeric,
  notes text,
  screenshot_url text,
  created_at timestamptz not null default now()
);

create table if not exists journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) default auth.uid(),
  trade_id uuid not null references trades(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);

alter table trades enable row level security;
alter table journal_entries enable row level security;

create policy "trades_select_own" on trades for select using (user_id = auth.uid());
create policy "trades_insert_own" on trades for insert with check (user_id = auth.uid());
create policy "trades_update_own" on trades for update using (user_id = auth.uid());
create policy "trades_delete_own" on trades for delete using (user_id = auth.uid());

create policy "journal_select_own" on journal_entries for select using (user_id = auth.uid());
create policy "journal_insert_own" on journal_entries for insert with check (user_id = auth.uid());
create policy "journal_update_own" on journal_entries for update using (user_id = auth.uid());
create policy "journal_delete_own" on journal_entries for delete using (user_id = auth.uid());

-- Storage bucket for trade screenshots (public read, authenticated write).
insert into storage.buckets (id, name, public)
values ('trade-screenshots', 'trade-screenshots', true)
on conflict (id) do nothing;

create policy "trade_screenshots_public_read"
  on storage.objects for select
  using (bucket_id = 'trade-screenshots');

create policy "trade_screenshots_auth_write"
  on storage.objects for insert
  with check (bucket_id = 'trade-screenshots' and auth.role() = 'authenticated');
