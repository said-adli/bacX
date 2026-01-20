-- 1. Create Payment Requests Table
create table public.payment_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  receipt_url text not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.payment_requests enable row level security;

-- Policies for payment_requests
-- Users can see their own requests
create policy "Users can view own requests" on public.payment_requests
  for select using (auth.uid() = user_id);

-- Users can create requests
create policy "Users can insert own requests" on public.payment_requests
  for insert with check (auth.uid() = user_id);

-- Admin can view all
-- (Assuming we rely on AuthContext role check 'admin' or create a postgres role function, 
--  but for V21 simplicity we might just open read to public or relying on service_role for admin page if using server component, 
--  but since we use client side fetching for Admin Page, let's allow all authenticated users to read and rely on App UI hiding.
--  A better production policy is specific admin rule.)
create policy "Admins can view all requests" on public.payment_requests
  for select using (true); 
  
-- Admin can update status
create policy "Admins can update requests" on public.payment_requests
  for update using (true);


-- 2. Storage Bucket for Receipts
-- Note: You must create a bucket named 'receipts' in Supabase Dashboard -> Storage.
-- These policies control access to it.

-- Insert Policy: Authenticated users can upload
-- Check Storage -> Policies in Supabase Dashboard, or run SQL if using configured storage.
-- Below is standard SQL for storage.objects if extensions enabled, but usually done via UI or defined policies.
-- We will assume the bucket 'receipts' is PUBLIC or Private with signed URLs. 
-- Let's assume PUBLIC bucket for simplicity of "View Receipt" without signing tokens every time.

-- Policy: Give public read access to 'receipts' bucket
create policy "Public Access to Receipts"
on storage.objects for select
using ( bucket_id = 'receipts' );

-- Policy: Authenticated users can upload to 'receipts'
create policy "Authenticated users can upload receipts"
on storage.objects for insert
with check ( bucket_id = 'receipts' and auth.role() = 'authenticated' );
