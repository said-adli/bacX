-- MIGRATION: ENABLE ADMIN GOD MODE
-- DATE: 2026-01-29
-- DESCRIPTION: Grants explicit UPDATE/DELETE privileges to Admins on restricted tables.

-- ==============================================================================
-- 1. SYSTEM SETTINGS (Maintenance Mode, Global Toggles)
-- ==============================================================================
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Allow Admins to UPDATE (Critical for "Toggle Maintenance Mode")
DROP POLICY IF EXISTS "Admins can update system settings" ON public.system_settings;
CREATE POLICY "Admins can update system settings" ON public.system_settings
FOR UPDATE
USING (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- Allow Admins to INSERT (For initializing settings)
DROP POLICY IF EXISTS "Admins can insert system settings" ON public.system_settings;
CREATE POLICY "Admins can insert system settings" ON public.system_settings
FOR INSERT
WITH CHECK (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- ==============================================================================
-- 2. PROFILES (Banning, Subscription Management)
-- ==============================================================================
-- Allow Admins to UPDATE any profile (Override "Users can only update own profile")
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles
FOR UPDATE
USING (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- ==============================================================================
-- 3. CONTENT (Lessons, Units - Full CRUD)
-- ==============================================================================
-- Lessons
DROP POLICY IF EXISTS "Admins manage lessons" ON public.lessons;
CREATE POLICY "Admins manage lessons" ON public.lessons
FOR ALL
USING (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- Units
DROP POLICY IF EXISTS "Admins manage units" ON public.units;
CREATE POLICY "Admins manage units" ON public.units
FOR ALL
USING (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- Programs/Majors (Just in case)
DROP POLICY IF EXISTS "Admins manage majors" ON public.majors;
CREATE POLICY "Admins manage majors" ON public.majors
FOR ALL
USING (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- Wilayas
DROP POLICY IF EXISTS "Admins manage wilayas" ON public.wilayas;
CREATE POLICY "Admins manage wilayas" ON public.wilayas
FOR ALL
USING (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);
