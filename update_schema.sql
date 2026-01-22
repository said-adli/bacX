-- 1. Create Units Table
create table if not exists public.units (
  id uuid default gen_random_uuid() primary key,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS on Units
alter table public.units enable row level security;

-- 3. Create Policies for Units (Public Read, Admin Write)
create policy "Enable read access for all users" on public.units
  for select using (true);

create policy "Enable insert for admins" on public.units
  for insert with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Enable update for admins" on public.units
  for update using (
      exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Enable delete for admins" on public.units
  for delete using (
      exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- 4. Update Lessons Table to include unit_id
alter table public.lessons add column if not exists unit_id uuid references public.units(id) on delete cascade;

-- Note: We are making unit_id optional initially to avoid breaking existing data, 
-- but the Frontend will enforce it for new lessons.
