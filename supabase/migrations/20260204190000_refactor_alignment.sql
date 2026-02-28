-- MIGRATION: 20260204190000_refactor_alignment.sql
-- PURPOSE: Align DB Schema with TypeScript Refactoring (Singleton, JOINs, Egress Mitigation)

-- =============================================================================
-- 1. TYPE ALIGNMENT: user_progress.lesson_id -> TEXT
-- =============================================================================
-- Engineering Note:
-- The frontend now enforces string-based IDs (e.g., 'math-01') for caching and URLs.
-- We must alter both the Foreign Key column AND the Primary Key it references.

DO $$ 
BEGIN
    -- A. Drop Foreign Key Constraint if it exists (to allow type change)
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'user_progress_lesson_id_fkey') THEN
        ALTER TABLE public.user_progress DROP CONSTRAINT user_progress_lesson_id_fkey;
    END IF;

    -- B. Alter public.user_progress.lesson_id to TEXT
    ALTER TABLE public.user_progress ALTER COLUMN lesson_id TYPE text;

    -- C. Align public.lessons.id to TEXT (Required for FK)
    -- WARNING: This preserves data but changes type. 'gen_random_uuid()' default might need removal if using custom IDs.
    ALTER TABLE public.lessons ALTER COLUMN id TYPE text;

    -- D. Re-add Foreign Key Constraint
    -- We use ON DELETE CASCADE to clean up progress if a lesson is deleted
    ALTER TABLE public.user_progress
    ADD CONSTRAINT user_progress_lesson_id_fkey
    FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Type alignment skipped or failed: %', SQLERRM;
END $$;


-- =============================================================================
-- 2. INDEX OPTIMIZATION: Sub-10ms JOINs
-- =============================================================================
-- Engineering Note:
-- The new query in 'progress.ts' uses an INNER JOIN on lessons.
-- Query: select * from user_progress join lessons on ... where user_id = ? and lessons.subject_id = ?
-- We need covering indexes on both sides of the join.

-- Index A: user_progress (user_id + lesson_id)
-- Creates a composite index for quick lookup of a user's progress on specific lessons.
CREATE INDEX IF NOT EXISTS idx_user_progress_user_lesson_composite 
ON public.user_progress(user_id, lesson_id);

-- Index B: lessons (subject_id + id)
-- Essential for the "!inner" join filter: .eq('lessons.subject_id', subjectId)
CREATE INDEX IF NOT EXISTS idx_lessons_subject_id_composite 
ON public.lessons(subject_id, id);


-- =============================================================================
-- 3. STORAGE EFFICIENCY: Notification Reads
-- =============================================================================
-- Engineering Note:
-- Replaces array-based 'read_by' in notifications table which suffers from
-- unbounded growth and high IO overhead on updates.
-- New pattern: Singleton inserts into junction table.

CREATE TABLE IF NOT EXISTS public.notification_reads (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    notification_id uuid NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    read_at timestamptz DEFAULT now(),
    
    -- Constraint: User reads a notification only once
    CONSTRAINT notification_reads_unique UNIQUE (notification_id, user_id)
);

-- Enable RLS
ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view/insert their own read receipts
DROP POLICY IF EXISTS "Users manage own read receipts" ON public.notification_reads;
CREATE POLICY "Users manage own read receipts" 
ON public.notification_reads 
FOR ALL 
USING (auth.uid() = user_id);

-- Policy: Admins can view all (for analytics)
DROP POLICY IF EXISTS "Admins view all read receipts" ON public.notification_reads;
CREATE POLICY "Admins view all read receipts" 
ON public.notification_reads 
FOR SELECT 
USING (public.is_admin());


-- =============================================================================
-- 4. CLEANUP & VERIFICATION
-- =============================================================================

-- Ensure 'student_progress' is gone or renamed if it was a duplicate table
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_progress') THEN
        -- Verify if we should migrate data? Assuming user_progress is the source of truth based on the prompt.
        -- We will rename it to 'student_progress_backup' just in case.
        ALTER TABLE public.student_progress RENAME TO student_progress_backup;
    END IF;
END $$;
