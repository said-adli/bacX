-- ==============================================================================
-- 1. DROP ALL EXISTING DUPLICATE/CONFLICTING POLICIES (CLEAN SLATE)
-- ==============================================================================

-- PROFILES
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public Read" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Self Insert" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Self Update" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins only can update roles" ON public.profiles;

-- PAYMENTS
DROP POLICY IF EXISTS "User Insert" ON public.payments;
DROP POLICY IF EXISTS "Users create payments" ON public.payments;
DROP POLICY IF EXISTS "Users view own payments" ON public.payments;
DROP POLICY IF EXISTS "Admin All" ON public.payments;
DROP POLICY IF EXISTS "Admins can update payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;

-- LESSONS
DROP POLICY IF EXISTS "Admin All" ON public.lessons;
DROP POLICY IF EXISTS "Authenticated Users View Permitted Lessons" ON public.lessons;
DROP POLICY IF EXISTS "Public Read" ON public.lessons;
DROP POLICY IF EXISTS "Service Role Full Access Lessons" ON public.lessons;

-- LIVE SESSIONS
DROP POLICY IF EXISTS "Public read live" ON public.live_sessions;

-- SUBJECTS
DROP POLICY IF EXISTS "Admin All" ON public.subjects;
DROP POLICY IF EXISTS "Public Read" ON public.subjects;

-- ADMIN LOGS
DROP POLICY IF EXISTS "Admins can insert logs" ON public.admin_logs;
DROP POLICY IF EXISTS "Admins can view logs" ON public.admin_logs;

-- GENERIC CLEANUP (Catch-calls for other tables mentioned)
DROP POLICY IF EXISTS "Public Read" ON public.announcements;
DROP POLICY IF EXISTS "Public read announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admin Insert" ON public.announcements;

DROP POLICY IF EXISTS "Admin full access for notifications" ON public.global_notifications;
DROP POLICY IF EXISTS "Public read access for notifications" ON public.global_notifications;

DROP POLICY IF EXISTS "Admin full access for lesson_resources" ON public.lesson_resources;
DROP POLICY IF EXISTS "Student read access for lesson_resources" ON public.lesson_resources;

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.live_interactions;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.live_interactions;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.live_interactions;

DROP POLICY IF EXISTS "Public read majors" ON public.majors;
DROP POLICY IF EXISTS "Public read wilayas" ON public.wilayas;

DROP POLICY IF EXISTS "Admins can manage notifications" ON public.notifications;
DROP POLICY IF EXISTS "Public can read global notifications" ON public.notifications;

DROP POLICY IF EXISTS "Admins can update receipts" ON public.payment_receipts;
DROP POLICY IF EXISTS "Admins can view all receipts" ON public.payment_receipts;
DROP POLICY IF EXISTS "Users can upload receipts" ON public.payment_receipts;
DROP POLICY IF EXISTS "Users can view own receipts" ON public.payment_receipts;

DROP POLICY IF EXISTS "Admin Select Only" ON public.security_logs;
DROP POLICY IF EXISTS "Service Role Only Insert" ON public.security_logs;


-- ==============================================================================
-- 2. ENABLE RLS ON ALL TABLES (SECURITY HARDENING)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.majors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wilayas ENABLE ROW LEVEL SECURITY;

-- CRITICAL: Tables that were disabled
ALTER TABLE public.analytics_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;


-- ==============================================================================
-- 3. CREATE CLEAN, STANDARDIZED POLICIES
-- ==============================================================================

-- --- PROFILES ---
-- Everyone can read profiles (needed for public features/checks)
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
-- Users can UPDATE their OWN profile
CREATE POLICY "Users Update Own Profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
-- Users can INSERT their OWN profile (Critical for Signup)
CREATE POLICY "Users Insert Own Profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
-- Admins have FULL ACCESS
CREATE POLICY "Admins Full Access Profiles" ON public.profiles FOR ALL USING (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- --- PAYMENTS ---
-- Users see their own
CREATE POLICY "Users View Own Payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
-- Users insert their own
CREATE POLICY "Users Insert Own Payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Admins Manage
CREATE POLICY "Admins Manage Payments" ON public.payments FOR ALL USING (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- --- LESSONS & SUBJECTS & LIVE SESSIONS ---
-- Authenticated Users Can READ
CREATE POLICY "Auth Read Lessons" ON public.lessons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth Read Subjects" ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth Read Live Sessions" ON public.live_sessions FOR SELECT TO authenticated USING (true);
-- Admins Manage
CREATE POLICY "Admins Manage Lessons" ON public.lessons FOR ALL USING (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
CREATE POLICY "Admins Manage Subjects" ON public.subjects FOR ALL USING (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
CREATE POLICY "Admins Manage Live" ON public.live_sessions FOR ALL USING (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- --- PUBLIC LOOKUP DATA (Majors, Wilayas) ---
CREATE POLICY "Public Read Majors" ON public.majors FOR SELECT USING (true);
CREATE POLICY "Public Read Wilayas" ON public.wilayas FOR SELECT USING (true);

-- --- ADMIN LOGS & ANALYTICS ---
-- Strictly Admins Only
CREATE POLICY "Admins Only Logs" ON public.admin_logs FOR ALL USING (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
CREATE POLICY "Admins Only Revenue" ON public.analytics_revenue FOR ALL USING (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
CREATE POLICY "Admins Only System Config" ON public.system_config FOR ALL USING (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
CREATE POLICY "Admins Only System Settings" ON public.system_settings FOR ALL USING (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- --- SECURITY LOGS ---
-- Service Role inserts (Edge Functions), Admins View
CREATE POLICY "Admins View Security Logs" ON public.security_logs FOR SELECT USING (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
-- Note: Insert is often done via Service Role which bypasses RLS, but we can explicit allow generic insert if needed, 
-- but usually Security Logs are strictly controlled. We'll leave it as Admin Read Only for now, assuming Service Role does the writing.

-- --- ANNOUNCEMENTS ---
CREATE POLICY "Public Read Announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Admins Manage Announcements" ON public.announcements FOR ALL USING (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
