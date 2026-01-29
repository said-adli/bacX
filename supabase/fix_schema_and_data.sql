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

-- Ensure the constraint exists (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_branch_id_fkey') THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_branch_id_fkey 
        FOREIGN KEY (branch_id) REFERENCES public.branches(id);
    END IF;
END $$;


-- PART 2: DATA CLEANUP (SUBJECTS)
-- 1. Delete invalid legacy subjects
DELETE FROM public.subjects 
WHERE id IN ('math', 'physics', 'science', 'tech', 'gest', 'letter', 'lang');

-- 2. Insert correct subjects with UUIDs
-- REMOVED branch_id as it does not exist in the table currently.
INSERT INTO public.subjects (id, name, icon)
VALUES 
  (gen_random_uuid(), 'Mathematics', 'Calculator'),
  (gen_random_uuid(), 'Physics', 'Atom'),
  (gen_random_uuid(), 'Natural Sciences', 'Dna'),
  (gen_random_uuid(), 'Literature', 'Book'),
  (gen_random_uuid(), 'English', 'Languages')
ON CONFLICT (name) DO NOTHING;
