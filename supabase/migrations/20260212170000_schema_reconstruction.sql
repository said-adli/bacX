-- ============================================================================
-- MIGRATION: 20260212170000_schema_reconstruction.sql
-- PURPOSE: "NUCLEAR RECONSTRUCTION" of schema to align with TypeScript code.
--   1. Drop ALL relevant FK constraints.
--   2. Force convert ID columns TEXT → UUID.
--   3. Rename published → is_active.
--   4. Rename start_time → started_at.
--   5. Re-establish relationships (UUID FKs).
--   6. Rebuild RPCs (toggle_resource_status, manage_subject).
--   7. Update RLS policies.
-- ============================================================================

-- ============================================================================
-- 1. DROP ALL CONSTRAINTS
-- ============================================================================

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop FKs for subjects(id) dependants
    FOR r IN (SELECT constraint_name, table_name FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY' AND table_name IN ('units', 'lessons') AND constraint_name LIKE '%subject_id%') LOOP
        EXECUTE 'ALTER TABLE ' || quote_ident(r.table_name) || ' DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;

    -- Drop FKs for lessons(id) dependants
    FOR r IN (SELECT constraint_name, table_name FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY' AND table_name IN ('user_progress', 'lesson_resources', 'student_progress', 'lesson_notes', 'live_sessions', 'lesson_attachments') AND constraint_name LIKE '%lesson_id%') LOOP
        EXECUTE 'ALTER TABLE ' || quote_ident(r.table_name) || ' DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

-- Explicitly drop known named constraints just in case (wrapped for safety)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'units') THEN
        ALTER TABLE units DROP CONSTRAINT IF EXISTS units_subject_id_fkey;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons') THEN
        ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_subject_id_fkey;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_progress') THEN
        ALTER TABLE user_progress DROP CONSTRAINT IF EXISTS user_progress_lesson_id_fkey;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lesson_resources') THEN
        ALTER TABLE lesson_resources DROP CONSTRAINT IF EXISTS lesson_resources_lesson_id_fkey;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_progress') THEN
        ALTER TABLE student_progress DROP CONSTRAINT IF EXISTS student_progress_lesson_id_fkey;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lesson_notes') THEN
        ALTER TABLE lesson_notes DROP CONSTRAINT IF EXISTS lesson_notes_lesson_id_fkey;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'live_sessions') THEN
        ALTER TABLE live_sessions DROP CONSTRAINT IF EXISTS live_sessions_lesson_id_fkey;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lesson_attachments') THEN
        ALTER TABLE lesson_attachments DROP CONSTRAINT IF EXISTS lesson_attachments_lesson_id_fkey;
    END IF;
END $$;


-- ============================================================================
-- 2. FORCE CONVERT TYPES (TEXT → UUID)
-- ============================================================================

-- Drop indexes on ID columns to allow type change
DROP INDEX IF EXISTS idx_lessons_subject_id;
DROP INDEX IF EXISTS idx_lessons_subject_id_composite;

-- Subjects PK
ALTER TABLE subjects ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE subjects ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Lessons PK
ALTER TABLE lessons ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE lessons ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Convert dependent columns (wrapped for safety)
DO $$
BEGIN
    -- subjects FKs
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'units') THEN
        ALTER TABLE units ALTER COLUMN subject_id TYPE UUID USING subject_id::uuid;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons') THEN
        ALTER TABLE lessons ALTER COLUMN subject_id TYPE UUID USING subject_id::uuid;
    END IF;

    -- lessons FKs
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_progress') THEN
        ALTER TABLE user_progress ALTER COLUMN lesson_id TYPE UUID USING lesson_id::uuid;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lesson_resources') THEN
        ALTER TABLE lesson_resources ALTER COLUMN lesson_id TYPE UUID USING lesson_id::uuid;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'live_sessions') THEN
        ALTER TABLE live_sessions ALTER COLUMN lesson_id TYPE UUID USING lesson_id::uuid;
    END IF;

    -- Optional tables
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_progress') THEN
        ALTER TABLE student_progress ALTER COLUMN lesson_id TYPE UUID USING lesson_id::uuid;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lesson_notes') THEN
         ALTER TABLE lesson_notes ALTER COLUMN lesson_id TYPE UUID USING lesson_id::uuid;
    END IF;
     IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lesson_attachments') THEN
         ALTER TABLE lesson_attachments ALTER COLUMN lesson_id TYPE UUID USING lesson_id::uuid;
    END IF;
END $$;


-- ============================================================================
-- 3 & 4. RENAME COLUMNS (published → is_active, start_time → started_at)
-- ============================================================================

DO $$
BEGIN
    -- Subjects: published → is_active
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subjects' AND column_name = 'published') THEN
        ALTER TABLE subjects RENAME COLUMN published TO is_active;
    END IF;

    -- Live Sessions: published → is_active
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'live_sessions' AND column_name = 'published') THEN
        ALTER TABLE live_sessions RENAME COLUMN published TO is_active;
    END IF;

    -- Live Sessions: start_time → started_at
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'live_sessions' AND column_name = 'start_time') THEN
        ALTER TABLE live_sessions RENAME COLUMN start_time TO started_at;
    END IF;
END $$;

-- Update indexes for new column names
DROP INDEX IF EXISTS subjects_published_idx;
DROP INDEX IF EXISTS live_sessions_published_idx;
CREATE INDEX IF NOT EXISTS subjects_is_active_idx ON subjects(is_active);
CREATE INDEX IF NOT EXISTS live_sessions_is_active_idx ON live_sessions(is_active);


-- ============================================================================
-- 5. RE-ESTABLISH RELATIONSHIPS
-- ============================================================================

-- Re-establish relationships (wrapped for safety)
DO $$
BEGIN
    -- Core tables
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'units') THEN
        ALTER TABLE units ADD CONSTRAINT units_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons') THEN
        ALTER TABLE lessons ADD CONSTRAINT lessons_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_progress') THEN
        ALTER TABLE user_progress ADD CONSTRAINT user_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lesson_resources') THEN
        ALTER TABLE lesson_resources ADD CONSTRAINT lesson_resources_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'live_sessions') THEN
        ALTER TABLE live_sessions ADD CONSTRAINT live_sessions_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE SET NULL;
    END IF;

    -- Optional tables
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_progress') THEN
        ALTER TABLE student_progress ADD CONSTRAINT student_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lesson_notes') THEN
        ALTER TABLE lesson_notes ADD CONSTRAINT lesson_notes_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lesson_attachments') THEN
         ALTER TABLE lesson_attachments ADD CONSTRAINT lesson_attachments_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_lessons_subject_id ON lessons(subject_id);
CREATE INDEX IF NOT EXISTS idx_lessons_subject_id_composite ON lessons(subject_id, id);


-- ============================================================================
-- 6. REBUILD RPCs
-- ============================================================================

-- Toggle Resource Status
DROP FUNCTION IF EXISTS public.toggle_resource_status(TEXT, TEXT, BOOLEAN);
DROP FUNCTION IF EXISTS public.toggle_resource_status(text, uuid, text, boolean);
DROP FUNCTION IF EXISTS public.toggle_resource_status(text, text, text, boolean);

CREATE OR REPLACE FUNCTION public.toggle_resource_status(
    resource_id TEXT,
    resource_type TEXT,
    new_status BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_target_table TEXT;
    v_target_column TEXT;
BEGIN
    CASE resource_type
        WHEN 'subject' THEN
            v_target_table := 'subjects';
            v_target_column := 'is_active';
        WHEN 'lesson' THEN
            v_target_table := 'lessons';
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'is_active') THEN
                v_target_column := 'is_active';
            ELSE
                v_target_column := 'is_public';
            END IF;
        WHEN 'user' THEN
            v_target_table := 'profiles';
            v_target_column := 'is_banned';
        WHEN 'coupon' THEN
            v_target_table := 'coupons';
            v_target_column := 'is_active';
        ELSE
            RAISE EXCEPTION 'Invalid resource type: %', resource_type;
    END CASE;

    EXECUTE format('UPDATE public.%I SET %I = $1 WHERE id = $2::uuid', v_target_table, v_target_column)
    USING new_status, resource_id;
END;
$$;

-- Manage Subject RPC
DROP FUNCTION IF EXISTS manage_subject(TEXT, TEXT, TEXT, UUID, INTEGER, BOOLEAN);
DROP FUNCTION IF EXISTS manage_subject(TEXT, TEXT, TEXT, UUID, INTEGER);

CREATE OR REPLACE FUNCTION manage_subject(
    p_name TEXT,
    p_icon TEXT DEFAULT 'Folder',
    p_operation_type TEXT DEFAULT 'create',
    p_subject_id UUID DEFAULT NULL,
    p_order INTEGER DEFAULT 0,
    p_is_active BOOLEAN DEFAULT TRUE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_role TEXT;
    v_result_id UUID;
BEGIN
    SELECT role INTO v_user_role FROM profiles WHERE id = auth.uid();
    IF v_user_role IS NULL OR v_user_role != 'admin' THEN
        RAISE EXCEPTION 'Access Denied: Only administrators can manage subjects.' USING ERRCODE = 'insufficient_privilege';
    END IF;

    IF p_operation_type = 'create' THEN
        INSERT INTO subjects (name, icon, "order", is_active, created_at)
        VALUES (p_name, p_icon, p_order, p_is_active, NOW())
        RETURNING id INTO v_result_id;
    ELSIF p_operation_type = 'update' THEN
        UPDATE subjects SET
            name = COALESCE(p_name, name),
            icon = COALESCE(p_icon, icon),
            "order" = COALESCE(p_order, "order"),
            is_active = COALESCE(p_is_active, is_active)
        WHERE id = p_subject_id
        RETURNING id INTO v_result_id;
    ELSE
        RAISE EXCEPTION 'Invalid operation_type: %', p_operation_type;
    END IF;

    RETURN v_result_id;
END;
$$;


-- ============================================================================
-- 7. REBUILD RLS POLICIES
-- ============================================================================

-- Live Sessions
DROP POLICY IF EXISTS "Student Read Live" ON live_sessions;
CREATE POLICY "Student Read Live" ON live_sessions
FOR SELECT USING (
    is_active = true
    AND EXISTS (
        SELECT 1 FROM user_subscriptions us
        WHERE us.user_id = auth.uid()
        AND us.plan_id = live_sessions.required_plan_id
        AND us.status = 'active'
    )
);

-- Lessons
DROP POLICY IF EXISTS "Student Read Lessons" ON public.lessons;
DROP POLICY IF EXISTS "Secure Read Lessons" ON public.lessons;
DROP POLICY IF EXISTS "Student read lessons" ON public.lessons;

CREATE POLICY "Student Read Lessons" ON public.lessons
FOR SELECT USING (
    is_free = true
    OR EXISTS (
        SELECT 1 FROM user_subscriptions us
        WHERE us.user_id = auth.uid()
        AND us.plan_id = lessons.required_plan_id
        AND us.status = 'active'
    )
    OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND (role = 'admin' OR role = 'teacher')
    )
);
