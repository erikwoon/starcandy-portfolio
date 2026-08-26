alter table trades
  add column if not exists order_time timestamptz,
  add column if not exists fill_time timestamptz;
