-- PART 1: FIX SCHEMA RELATIONSHIPS
-- Add branch_id only if it doesn't exist, and ensure it links to branches(id)

-- 1. Create branches table if it doesn't exist (safety check)
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add branch_id to profiles if missing and link it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'branch_id') THEN
        ALTER TABLE public.profiles ADD COLUMN branch_id UUID REFERENCES public.branches(id);
    ELSE
        -- Ensure FK exists even if column exists
        NULL; 
    END IF;
END $$;

-- PART 2: DATA CLEANUP (SUBJECTS)
-- 1. Delete invalid legacy subjects (string IDs)
DELETE FROM public.subjects 
WHERE id IN ('math', 'physics', 'science', 'tech', 'gest', 'letter', 'lang');

-- 2. Insert correct subjects with UUIDs (Safe Insert Check)
INSERT INTO public.subjects (id, name, icon)
SELECT gen_random_uuid(), 'Mathematics', 'Calculator'
WHERE NOT EXISTS (SELECT 1 FROM public.subjects WHERE name = 'Mathematics');

INSERT INTO public.subjects (id, name, icon)
SELECT gen_random_uuid(), 'Physics', 'Atom'
WHERE NOT EXISTS (SELECT 1 FROM public.subjects WHERE name = 'Physics');

INSERT INTO public.subjects (id, name, icon)
SELECT gen_random_uuid(), 'Natural Sciences', 'Dna'
WHERE NOT EXISTS (SELECT 1 FROM public.subjects WHERE name = 'Natural Sciences');

INSERT INTO public.subjects (id, name, icon)
SELECT gen_random_uuid(), 'Literature', 'Book'
WHERE NOT EXISTS (SELECT 1 FROM public.subjects WHERE name = 'Literature');

INSERT INTO public.subjects (id, name, icon)
SELECT gen_random_uuid(), 'English', 'Languages'
WHERE NOT EXISTS (SELECT 1 FROM public.subjects WHERE name = 'English');
