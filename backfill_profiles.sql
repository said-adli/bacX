-- BACKFILL: Sync auth.users metadata to public.profiles
UPDATE public.profiles p
SET
    full_name = COALESCE(
        NULLIF(p.full_name, ''),
        (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = p.id)
    ),
    wilaya = COALESCE(
        NULLIF(p.wilaya, ''),
        (SELECT raw_user_meta_data->>'wilaya' FROM auth.users WHERE id = p.id)
    ),
    major = COALESCE(
        NULLIF(p.major, ''),
        (SELECT raw_user_meta_data->>'major' FROM auth.users WHERE id = p.id)
    ),
    phone_number = COALESCE(
        NULLIF(p.phone_number, ''),
        (SELECT raw_user_meta_data->>'phone' FROM auth.users WHERE id = p.id)
    ),
    updated_at = NOW()
WHERE EXISTS (
    SELECT 1 FROM auth.users u 
    WHERE u.id = p.id 
    AND u.raw_user_meta_data IS NOT NULL
);
