-- Migration: Deprecate is_subscribed boolean
-- Date: 2026-01-24

-- 0. CRITICAL: Drop the Policy that depends on `is_subscribed`
-- This closes the IDOR vulnerability (Open Bucket) and allows us to drop the column.
DROP POLICY IF EXISTS "Subscribed users read course-materials" ON storage.objects;

-- 0b. Drop dependency on lesson_resources and recreate strictly
DROP POLICY IF EXISTS "Student read access for lesson_resources" ON public.lesson_resources;

CREATE POLICY "Student read access for lesson_resources" ON public.lesson_resources
FOR SELECT USING (
  auth.role() = 'authenticated' AND (
    EXISTS (
      SELECT 1 FROM public.lessons l
      LEFT JOIN public.profiles p ON p.id = auth.uid()
      WHERE l.id = lesson_resources.lesson_id
      AND (
        l.required_plan_id IS NULL 
        OR p.active_plan_id = l.required_plan_id
        OR p.role = 'admin'
      )
    )
  )
);

-- 1. Create a "Legacy" Plan if it doesn't exist
INSERT INTO public.subscription_plans (id, name, price, description, is_active)
VALUES ('00000000-0000-0000-0000-000000000000', 'Legacy Plan', 0, 'Auto-migrated from legacy system', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Migrate Users
UPDATE public.profiles
SET active_plan_id = '00000000-0000-0000-0000-000000000000'
WHERE is_subscribed = true 
AND active_plan_id IS NULL;

-- 3. Drop the Column
-- CAUTION: This breaks any code still relying on 'is_subscribed'. 
-- Ensure Step 1 (Secure Storage) and Step 3 (Admin) are deployed first.
ALTER TABLE public.profiles
DROP COLUMN is_subscribed;
