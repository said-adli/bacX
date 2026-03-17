-- ==============================================================================
-- MIGRATION: Fix Signup Data Loss
-- Purpose: Ensure wilaya_id and major_id are extracted from metadata.
-- ==============================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    role,
    wilaya,
    wilaya_id,
    major,
    major_id,
    study_system,
    phone_number,
    is_profile_complete,
    updated_at
  )
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'wilaya',
    (new.raw_user_meta_data->>'wilaya_id')::int, -- wilayas usually use int IDs
    new.raw_user_meta_data->>'major',
    (new.raw_user_meta_data->>'major_id')::uuid, -- majors use UUIDs
    new.raw_user_meta_data->>'study_system',
    new.raw_user_meta_data->>'phone',
    true,
    now()
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    wilaya = excluded.wilaya,
    wilaya_id = excluded.wilaya_id,
    major = excluded.major,
    major_id = excluded.major_id,
    study_system = excluded.study_system,
    phone_number = excluded.phone_number,
    is_profile_complete = true,
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;
