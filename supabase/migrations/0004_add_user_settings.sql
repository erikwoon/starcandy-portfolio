create table if not exists user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  starting_balance numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table user_settings enable row level security;

create policy "user_settings_select_own" on user_settings for select using (user_id = auth.uid());
create policy "user_settings_insert_own" on user_settings for insert with check (user_id = auth.uid());
create policy "user_settings_update_own" on user_settings for update using (user_id = auth.uid());
create policy "user_settings_delete_own" on user_settings for delete using (user_id = auth.uid());
