/*
 * GLOBAL SECURITY LOCKDOWN - ZERO TRUST PROTOCOL (v2 - RECURSION FIXED)
 * -----------------------------------------------------------------------------
 * OBJECTIVE: Enable RLS on ALL tables and enforce strict Role-Based Access.
 * UPDATES: Uses is_admin() security definer to prevent infinite loops.
 * -----------------------------------------------------------------------------
 */

-- -------------------------------------------------------------------------
-- STEP 0: HELPER FUNCTIONS
-- -------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$;


DO $$
DECLARE
    r RECORD;
BEGIN
    -- -------------------------------------------------------------------------
    -- STEP 1: CLEAN SLATE (Dynamic Policy Drop)
    -- -------------------------------------------------------------------------
    -- Safely drop all policies from the public schema to ensure no conflicts.
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;


-- -------------------------------------------------------------------------
-- STEP 2: CATEGORY 1 - PRIVATE USER DATA (Owner Access Only)
-- -------------------------------------------------------------------------
-- Tables: profiles, payment_receipts, profile_change_requests

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Private: Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Private: Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Private: Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- PAYMENT_RECEIPTS
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Private: Users view own receipts" ON public.payment_receipts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Private: Users upload receipts" ON public.payment_receipts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- PROFILE_CHANGE_REQUESTS
ALTER TABLE public.profile_change_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Private: Users view own requests" ON public.profile_change_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Private: Users create requests" ON public.profile_change_requests FOR INSERT WITH CHECK (auth.uid() = user_id);


-- -------------------------------------------------------------------------
-- STEP 3: CATEGORY 2 - PUBLIC CONTENT (Read-Only for Users, Admin Write)
-- -------------------------------------------------------------------------
-- Tables: subjects, majors, wilayas, subscription_plans, 
--         lessons, units, lesson_resources

-- SUBJECTS
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public: View subjects" ON public.subjects FOR SELECT USING (true);

-- MAJORS
ALTER TABLE public.majors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public: View majors" ON public.majors FOR SELECT USING (true);

-- WILAYAS
ALTER TABLE public.wilayas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public: View wilayas" ON public.wilayas FOR SELECT USING (true);

-- SUBSCRIPTION_PLANS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public: View active plans" ON public.subscription_plans FOR SELECT USING (is_active = true);



-- LESSONS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public: View lessons" ON public.lessons FOR SELECT USING (true);

-- UNITS
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public: View units" ON public.units FOR SELECT USING (true);

-- LESSON_RESOURCES
ALTER TABLE public.lesson_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public: View resources" ON public.lesson_resources FOR SELECT USING (true);


-- -------------------------------------------------------------------------
-- STEP 4: CATEGORY 3 - SYSTEM & ADMIN (Restricted - No Public Access)
-- -------------------------------------------------------------------------
-- Tables: admin_logs, security_logs, system_settings, system_config

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;


-- -------------------------------------------------------------------------
-- STEP 5: ADMIN OVERRIDE (Using is_admin function)
-- -------------------------------------------------------------------------

-- PROFILES (Admin View All)
CREATE POLICY "Admin: View all profiles" ON public.profiles FOR SELECT USING ( is_admin() );

-- PAYMENTS (Admin View/Update All)
CREATE POLICY "Admin: Manage receipts" ON public.payment_receipts FOR ALL USING ( is_admin() );

-- CONTENT MANAGEMENT (Admins can CRUD content)
CREATE POLICY "Admin: Manage subjects" ON public.subjects FOR ALL USING ( is_admin() );
CREATE POLICY "Admin: Manage units" ON public.units FOR ALL USING ( is_admin() );
CREATE POLICY "Admin: Manage lessons" ON public.lessons FOR ALL USING ( is_admin() );
CREATE POLICY "Admin: Manage plans" ON public.subscription_plans FOR ALL USING ( is_admin() );


-- SYSTEM LOGS (Admins can View)
CREATE POLICY "Admin: View admin_logs" ON public.admin_logs FOR SELECT USING ( is_admin() );
CREATE POLICY "Admin: View security_logs" ON public.security_logs FOR SELECT USING ( is_admin() );
