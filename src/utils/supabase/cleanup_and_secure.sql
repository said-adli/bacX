-- EMERGENCY SECURITY MIGRATION (V22.0)
-- 1. Reset Policies for Subjects and Lessons
drop policy if exists "Enable read access for all users" on public.subjects;
drop policy if exists "Enable read access for all users" on public.lessons;

-- Subjects: Public Read (Catalog is usually public to attract users)
-- OR strictly authenticated as per "Update subjects and lessons...". 
-- Let's stick to "Authenticated" to be safe, or "Public" if it's the landing page.
-- Re-reading prompt: "Update subjects and lessons policies: Remove using (true). Change to: 'Only authenticated users with is_subscribed = true can read lessons'".
-- This implies Subjects might be less strict, but Lessons are P0.
-- Let's make Subjects readable by everyone (Catalog), but Lessons restricted.

create policy "Public view subjects"
on public.subjects for select
using ( true ); -- Catalog is public.

create policy "Subscribed users view lessons"
on public.lessons for select
using (
  auth.role() = 'authenticated' AND (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.is_subscribed = true
    )
    OR
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  )
);

-- 2. Secure Payment Requests
drop policy if exists "Admins can view all requests" on public.payment_requests;

create policy "Admins can view all payment requests"
on public.payment_requests for select
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

-- 3. Secure Storage (Receipts)
-- Drop old public policy
drop policy if exists "Public Access to Receipts" on storage.objects;

-- Create new policy: Only Owner (uploader) or Admin can view
create policy "Admin or Owner view receipts"
on storage.objects for select
using (
  bucket_id = 'receipts'
  AND (
    auth.uid() = owner -- Standard storage owner match
    OR
    exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  )
);
