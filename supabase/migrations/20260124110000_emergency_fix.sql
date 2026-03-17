-- Migration: Emergency Remediation (RLS Lockdown, System Config, Session Tracking)
-- Priority: P0 (Critical Security Fixes)

-- ==============================================================================
-- 1. SYSTEM CONFIG (Kill Switch)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.system_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for System Config
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Public Read (Service uses this, and Middleware needs it fast)
CREATE POLICY "Admin full access system_config" ON public.system_config 
    FOR ALL 
    USING (auth.role() = 'service_role' OR exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

-- Default Value
INSERT INTO public.system_config (key, value) VALUES ('maintenance_mode', 'false'::jsonb) ON CONFLICT DO NOTHING;


-- ==============================================================================
-- 2. RLS LOCKDOWN (Lessons Results)
-- ==============================================================================
-- DROP dangerous policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.lessons;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.subjects; 

-- NEW POLICY: Strict Select

-- 1. Service Role (API) -> FULL ACCESS
CREATE POLICY "Service Role Full Access Lessons" ON public.lessons
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 2. Authenticated Users -> Conditional Access

-- BUG FIX: Ensure column exists first
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS active_plan_id UUID REFERENCES public.subscription_plans(id);

CREATE INDEX IF NOT EXISTS idx_lessons_required_plan ON public.lessons(required_plan_id);
CREATE INDEX IF NOT EXISTS idx_profiles_active_plan ON public.profiles(active_plan_id);

CREATE POLICY "Authenticated Users View Permitted Lessons" ON public.lessons
    FOR SELECT
    TO authenticated
    USING (
        -- 1. Lesson is Free
        is_free = true
        OR 
        -- 2. Lesson matches User's Plan (Check Profile)
        required_plan_id IN (
            SELECT active_plan_id 
            FROM public.profiles 
            WHERE id = auth.uid()
        )
        OR
        -- 3. Admin Override
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ==============================================================================
-- 3. SESSION SCALABILITY (Custom Claims)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_session()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the user's metadata with the new session ID
  UPDATE auth.users
  SET raw_app_meta_data = 
    coalesce(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('current_session_id', NEW.id)
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS on_auth_session_created ON auth.sessions;

CREATE TRIGGER on_auth_session_created
  AFTER INSERT ON auth.sessions
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_session();


