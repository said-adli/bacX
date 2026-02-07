-- Migration: Bridge Auth Metadata to Public Profiles
-- Date: 2026-01-24
-- Purpose: Sync user metadata from auth.users to public.profiles
-- Fixed: Add missing text columns if they don't exist before backfill

-- ============================================
-- PART 0: ENSURE REQUIRED COLUMNS EXIST
-- ============================================

DO $$
BEGIN
    -- Add wilaya column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'wilaya') THEN
        ALTER TABLE public.profiles ADD COLUMN wilaya TEXT;
        RAISE NOTICE 'Added wilaya column';
    END IF;

    -- Add major column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'major') THEN
        ALTER TABLE public.profiles ADD COLUMN major TEXT;
        RAISE NOTICE 'Added major column';
    END IF;

    -- Add study_system column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'study_system') THEN
        ALTER TABLE public.profiles ADD COLUMN study_system TEXT;
        RAISE NOTICE 'Added study_system column';
    END IF;

    -- Add bio column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'bio') THEN
        ALTER TABLE public.profiles ADD COLUMN bio TEXT;
        RAISE NOTICE 'Added bio column';
    END IF;

    -- Add phone_number column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'phone_number') THEN
        ALTER TABLE public.profiles ADD COLUMN phone_number TEXT;
        RAISE NOTICE 'Added phone_number column';
    END IF;

    -- Add full_name column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
        RAISE NOTICE 'Added full_name column';
    END IF;
END $$;

-- ============================================
-- PART 1: CREATE/UPDATE THE SIGNUP TRIGGER
-- ============================================

-- Drop existing trigger and function if they exist (to allow update)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the function that runs on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        wilaya,
        major,
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
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        'student', -- Default role
        COALESCE((NEW.raw_user_meta_data->>'is_profile_complete')::boolean, false),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
        wilaya = COALESCE(NULLIF(EXCLUDED.wilaya, ''), profiles.wilaya),
        major = COALESCE(NULLIF(EXCLUDED.major, ''), profiles.major),
        phone_number = COALESCE(NULLIF(EXCLUDED.phone_number, ''), profiles.phone_number),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users INSERT
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();


-- ============================================
-- PART 2: BACKFILL EXISTING USERS
-- ============================================

-- Sync data from auth.users.raw_user_meta_data to public.profiles
-- for all existing users where profile fields are NULL or empty

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
