create table if not exists trade_fills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) default auth.uid(),
  source_key text not null,
  symbol text not null,
  ticker text not null,
  type text not null check (type in ('Call', 'Put')),
  strike text not null,
  expiry date not null,
  side text not null check (side in ('Buy', 'Sell')),
  qty integer not null check (qty > 0),
  price numeric not null check (price > 0),
  fee numeric not null default 0,
  order_time timestamptz not null,
  fill_time timestamptz not null,
  created_at timestamptz not null default now(),
  unique(user_id, source_key)
);

alter table trade_fills enable row level security;

create policy "trade_fills_select_own" on trade_fills for select using (user_id = auth.uid());
create policy "trade_fills_insert_own" on trade_fills for insert with check (user_id = auth.uid());
create policy "trade_fills_update_own" on trade_fills for update using (user_id = auth.uid());
create policy "trade_fills_delete_own" on trade_fills for delete using (user_id = auth.uid());
