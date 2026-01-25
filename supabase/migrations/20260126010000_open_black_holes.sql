-- ==============================================================================
-- PHASE 2: OPENING THE "BLACK HOLES" & FINAL CLEANUP
-- ==============================================================================

-- 1. NOTIFICATIONS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users Read Own Notifications" ON public.notifications;
CREATE POLICY "Users Read Own Notifications" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public Read Global Notifications" ON public.global_notifications;
CREATE POLICY "Public Read Global Notifications" ON public.global_notifications
FOR SELECT USING (true);


-- 2. LESSONS RESOURCES
ALTER TABLE public.lesson_resources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth Read Lesson Resources" ON public.lesson_resources;
CREATE POLICY "Auth Read Lesson Resources" ON public.lesson_resources
FOR SELECT TO authenticated USING (true);


-- 3. LIVE INTERACTIONS (Chat/Q&A)
ALTER TABLE public.live_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth Insert Live Interactions" ON public.live_interactions;
CREATE POLICY "Auth Insert Live Interactions" ON public.live_interactions
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Auth Read Live Interactions" ON public.live_interactions;
CREATE POLICY "Auth Read Live Interactions" ON public.live_interactions
FOR SELECT TO authenticated USING (true);


-- 4. PAYMENT RECEIPTS
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users Upload Receipts" ON public.payment_receipts;
CREATE POLICY "Users Upload Receipts" ON public.payment_receipts
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users View Own Receipts" ON public.payment_receipts;
CREATE POLICY "Users View Own Receipts" ON public.payment_receipts
FOR SELECT USING (auth.uid() = user_id);


-- 5. SUBSCRIPTION PLANS (Cleanup & Standardize)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Drop all chaos
DROP POLICY IF EXISTS "Admin full access for plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Admins can manage plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Admins can view all plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Public can view active plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Public read access for plans" ON public.subscription_plans;

-- Create clean
DROP POLICY IF EXISTS "Public Read Plans" ON public.subscription_plans;
CREATE POLICY "Public Read Plans" ON public.subscription_plans
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins Manage Plans" ON public.subscription_plans;
CREATE POLICY "Admins Manage Plans" ON public.subscription_plans
FOR ALL USING (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);


-- 6. SYSTEM CONFIG CLEANUP
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access system_config" ON public.system_config;
-- (We assume "Admins Only System Config" exists from Phase 1, or we leave it clean if empty)

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin write system settings" ON public.system_settings;
