-- -------------------------------------------------------------------------
-- MIGRATION: 20260212150000_fix_lesson_rls_published_check.sql
-- PURPOSE: Consolidate lesson RLS to a single clean policy.
--          Lessons do NOT have a 'published' column; visibility is
--          inherited from the parent subject at the application layer.
--          RLS here enforces: is_free OR plan-match OR admin/teacher.
-- -------------------------------------------------------------------------

-- Clean up any conflicting policies
DROP POLICY IF EXISTS "Student read lessons" ON public.lessons;
DROP POLICY IF EXISTS "Student Read Lessons" ON public.lessons;
DROP POLICY IF EXISTS "Secure Read Lessons" ON public.lessons;

-- Recreate consolidated student read policy
CREATE POLICY "Student Read Lessons" ON public.lessons
FOR SELECT
USING (
  -- A. Free content is always visible
  is_free = true
  OR
  -- B. Plan-matched subscription
  EXISTS (
    SELECT 1 FROM user_subscriptions us
    WHERE us.user_id = auth.uid()
    AND us.plan_id = lessons.required_plan_id
    AND us.status = 'active'
  )
  OR
  -- C. Admin/Teacher override
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (role = 'admin' OR role = 'teacher')
  )
);
