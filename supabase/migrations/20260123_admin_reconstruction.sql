-- Migration: Admin Reconstruction v2 Support
-- Added: duration_days and type to subscription_plans
-- Added: required_plan_id to lessons
-- Added: global_notifications table

-- 1. Update subscription_plans table
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS duration_days INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'subscription' CHECK (type IN ('subscription', 'course'));

-- 2. Update lessons table for Granular Access Control
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS required_plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL;

-- 3. Create global_notifications table
CREATE TABLE IF NOT EXISTS public.global_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- 4. Enable RLS for global_notifications
ALTER TABLE public.global_notifications ENABLE ROW LEVEL SECURITY;

-- 5. Policies for global_notifications

-- Public Read
DROP POLICY IF EXISTS "Public read access for notifications" ON public.global_notifications;
CREATE POLICY "Public read access for notifications" ON public.global_notifications
FOR SELECT USING (true);

-- Admin Insert
DROP POLICY IF EXISTS "Admin insert access for notifications" ON public.global_notifications;
CREATE POLICY "Admin insert access for notifications" ON public.global_notifications
FOR INSERT WITH CHECK (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- Admin Update
DROP POLICY IF EXISTS "Admin update access for notifications" ON public.global_notifications;
CREATE POLICY "Admin update access for notifications" ON public.global_notifications
FOR UPDATE USING (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- Admin Delete
DROP POLICY IF EXISTS "Admin delete access for notifications" ON public.global_notifications;
CREATE POLICY "Admin delete access for notifications" ON public.global_notifications
FOR DELETE USING (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);
