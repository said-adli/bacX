-- Create billing_history table
create table if not exists billing_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  plan_type text not null, -- 'Standard', 'Premium', 'VIP'
  amount text not null, -- Stored as text for display '2000 DZD' or decimal
  status text not null check (status in ('pending', 'completed', 'failed')),
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  invoice_url text -- Optional link to PDF
);

-- Enable RLS
alter table billing_history enable row level security;

-- Policies
create policy "Users can view their own billing history"
  on billing_history for select
  using (auth.uid() = user_id);

-- Create coupons table
create table if not exists coupons (
  code text primary key,
  discount_percent integer not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS for coupons (Public read for validation, Admin write)
alter table coupons enable row level security;

create policy "Coupons are viewable by everyone"
  on coupons for select
  using (true);
