-- Migration: Add study_system to profile trigger
-- Date: 2026-01-24
-- Purpose: Ensure study_system is captured from signup metadata

-- Update the trigger function to include study_system
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        wilaya,
        major,
        study_system,
        phone_number,
        role,
        is_profile_complete,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'wilaya', ''),
        COALESCE(NEW.raw_user_meta_data->>'major', ''),
        COALESCE(NEW.raw_user_meta_data->>'study_system', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
        COALESCE((NEW.raw_user_meta_data->>'is_profile_complete')::boolean, false),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
        wilaya = COALESCE(NULLIF(EXCLUDED.wilaya, ''), profiles.wilaya),
        major = COALESCE(NULLIF(EXCLUDED.major, ''), profiles.major),
        study_system = COALESCE(NULLIF(EXCLUDED.study_system, ''), profiles.study_system),
        phone_number = COALESCE(NULLIF(EXCLUDED.phone_number, ''), profiles.phone_number),
        is_profile_complete = COALESCE(EXCLUDED.is_profile_complete, profiles.is_profile_complete),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
