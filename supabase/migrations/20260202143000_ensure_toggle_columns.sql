-- Add published to subjects
alter table public.subjects 
add column if not exists published boolean default false;

-- Add is_banned to profiles if missing (usually handled by auth trigger but ensuring)
alter table public.profiles
add column if not exists is_banned boolean default false;
