-- ==============================================================================
-- PHASE 3: FINAL SYSTEM CLEANUP
-- ==============================================================================

-- 1. SYSTEM CONFIG
-- We remove the old "Admin full access system_config"
-- We rely on "Admins Only System Config" created in Phase 1
DROP POLICY IF EXISTS "Admin full access system_config" ON public.system_config;


-- 2. SYSTEM SETTINGS
-- We remove "Admin write system settings"
-- We rely on "Admins Only System Settings" created in Phase 1
DROP POLICY IF EXISTS "Admin write system settings" ON public.system_settings;


-- 3. ADMIN LOGS (Safety Cleanup)
-- We remove potentially duplicate policies
DROP POLICY IF EXISTS "Admins can insert logs" ON public.admin_logs;
DROP POLICY IF EXISTS "Admins can view logs" ON public.admin_logs;
-- We rely on "Admins Only Logs" created in Phase 1
