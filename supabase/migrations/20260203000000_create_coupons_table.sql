-- Create Coupons Table
create type discount_type as enum ('percent', 'fixed');

create table public.coupons (
    id uuid default gen_random_uuid() primary key,
    code text not null unique,
    discount_type discount_type not null,
    value numeric not null,
    max_uses integer not null default 1, -- e.g. 100
    used_count integer not null default 0,
    expires_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    is_active boolean default true
);

-- RLS
alter table public.coupons enable row level security;

-- Admin: Full Access
create policy "Admins can manage coupons"
on public.coupons
for all
using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- Public/User: Read Only (For validation)
-- Note: Exposing full list is dangerous. Ideally we should restrict this, 
-- but explicit request was "User read". We can limit to valid coupons?
create policy "Users can read coupons"
on public.coupons
for select
using (true);

-- Atomic Increment Function
create or replace function public.increment_coupon_usage(coupon_code text)
returns void
language plpgsql
security definer
as $$
begin
  update public.coupons
  set used_count = used_count + 1
  where code = coupon_code;
end;
$$;
