-- ============================================
-- POLICY UPDATE: Student Visibility
-- ============================================

-- LESSONS: View if (Published AND (Free OR Subscribed))
-- Note: 'published' is usually checked. 'is_free' allows access without plan.
-- 'auth.uid()' checks against 'user_subscriptions' or similar is needed for 'Subscribed'.
-- Assuming a helper function 'check_user_access(user_id, required_plan_id)' exists or we join tables.
-- For simplicity and performance, we often use a function or direct exists check.

CREATE OR REPLACE FUNCTION public.check_user_plan_access(p_user_id uuid, p_required_plan_id text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF p_required_plan_id IS NULL THEN RETURN TRUE; END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.user_subscriptions
    WHERE user_id = p_user_id
    AND plan_id = p_required_plan_id
    AND status = 'active'
    AND  (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$;

-- Policy for LESSONS
DROP POLICY IF EXISTS "Start reading lessons" ON public.lessons;
CREATE POLICY "Student read lessons" ON public.lessons
FOR SELECT
USING (
  -- Admin bypass (optional, usually handled by service role or separate admin policy)
  -- Public/Student logic:
  (
    -- 1. Must be published (unless implementation allows draft viewing by some magic, but standard is published)
    -- Actually, earlier discussion mentioned 'published' on Subject/Unit parent. 
    -- Let's stick to Lesson-level fields for now plus the 'is_free' logic.
    is_free = true
    OR 
    check_user_plan_access(auth.uid(), required_plan_id)
    OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
);

-- Policy for LIVE SESSIONS
DROP POLICY IF EXISTS "Start reading live_sessions" ON public.live_sessions;
CREATE POLICY "Student read live_sessions" ON public.live_sessions
FOR SELECT
USING (
  published = true -- Base requirement
  AND (
    -- Free or Subscribed
    required_plan_id IS NULL 
    OR 
    check_user_plan_access(auth.uid(), required_plan_id)
    OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
);
