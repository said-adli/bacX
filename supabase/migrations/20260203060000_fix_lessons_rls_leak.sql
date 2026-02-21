-- Migration: Fix Critical RLS Content Leak
-- Date: 2026-02-03
-- Objective: Restrict access to `lessons` table. Only allow if Free OR Subscribed.

-- 1. Drop the insecure "Allow All" policy
DROP POLICY IF EXISTS "Auth Read Lessons" ON public.lessons;

-- 2. Create the Secure Policy
DROP POLICY IF EXISTS "Secure Read Lessons" ON public.lessons;
-- Logic:
-- - Admins: SEE ALL
-- - Users: See if `is_free` OR `is_subscribed`/Match Plan
CREATE POLICY "Secure Read Lessons" ON public.lessons
FOR SELECT TO authenticated
USING (
    -- A. Admin Override (Optimized Check)
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    
    OR
    
    -- B. Public/Free Content
    is_free = true
    
    OR
    
    -- C. Subscription Check
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND (
            -- 1. Global Subscription (Simple Model)
            -- We check the boolean flag OR if the plan is active.
            -- This covers both legacy and new subscription models.
            p.is_subscribed = true
            
            OR
            
            -- 2. Plan Specific Access (Advanced Model)
            -- If the lesson requires a specific plan, the user must have it.
            (
                required_plan_id IS NOT NULL 
                AND 
                p.active_plan_id = required_plan_id
            )
        )
    )
);

-- 3. Verify RLS is enabled (Safety Check)
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
