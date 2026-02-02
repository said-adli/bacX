-- Secure Payment Requests Table (Refined)
-- Migration: 20260202203415_secure_payment_rls

-- 1. Reset Policies
drop policy if exists "Users can view own requests" on public.payment_requests;
drop policy if exists "Users can insert own requests" on public.payment_requests;
drop policy if exists "Admins can view all requests" on public.payment_requests;
drop policy if exists "Admins can update requests" on public.payment_requests;
drop policy if exists "View Payment Requests" on public.payment_requests;
drop policy if exists "Create Payment Requests" on public.payment_requests;
drop policy if exists "Admin Update Payment Requests" on public.payment_requests;
drop policy if exists "Admin Delete Payment Requests" on public.payment_requests;

-- Ensure RLS is enabled
alter table public.payment_requests enable row level security;

-- 2. Define Strict Policies

-- Policy 1 (Users): Access Own Data
-- SELECT: Users can view their own requests.
create policy "User View Own Requests"
on public.payment_requests for select
using ( auth.uid() = user_id );

-- INSERT: Users can create requests for themselves.
create policy "User Create Own Requests"
on public.payment_requests for insert
with check ( auth.uid() = user_id );

-- Policy 2 (Admins): Full Control
-- SELECT, UPDATE, DELETE: Admins can do everything.
create policy "Admin Manage All Requests"
on public.payment_requests for all
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);
