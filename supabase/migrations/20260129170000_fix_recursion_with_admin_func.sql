/*
 * FIX INFINITE RECURSION IN RLS
 * -----------------------------------------------------------------------------
 * OBJECTIVE: Break the recursion loop by using a SECURITY DEFINER function.
 * PROBLEM: "Admin: View all profiles" checks 'profiles' table, triggering itself.
 * SOLUTION: is_admin() function reads 'profiles' directly (bypassing RLS).
 * -----------------------------------------------------------------------------
 */

-- 1. Create the helper function
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

-- 2. Update Admin Policies to use the function

-- PROFILES
DROP POLICY IF EXISTS "Admin: View all profiles" ON public.profiles;
CREATE POLICY "Admin: View all profiles" ON public.profiles FOR SELECT USING ( is_admin() );

-- PAYMENTS
DROP POLICY IF EXISTS "Admin: Manage receipts" ON public.payment_receipts;
CREATE POLICY "Admin: Manage receipts" ON public.payment_receipts FOR ALL USING ( is_admin() );

-- CONTENT
DROP POLICY IF EXISTS "Admin: Manage subjects" ON public.subjects;
CREATE POLICY "Admin: Manage subjects" ON public.subjects FOR ALL USING ( is_admin() );

DROP POLICY IF EXISTS "Admin: Manage units" ON public.units;
CREATE POLICY "Admin: Manage units" ON public.units FOR ALL USING ( is_admin() );

DROP POLICY IF EXISTS "Admin: Manage lessons" ON public.lessons;
CREATE POLICY "Admin: Manage lessons" ON public.lessons FOR ALL USING ( is_admin() );

DROP POLICY IF EXISTS "Admin: Manage plans" ON public.subscription_plans;
CREATE POLICY "Admin: Manage plans" ON public.subscription_plans FOR ALL USING ( is_admin() );

DROP POLICY IF EXISTS "Admin: Manage notifications" ON public.global_notifications;
CREATE POLICY "Admin: Manage notifications" ON public.global_notifications FOR ALL USING ( is_admin() );

-- LOGS
DROP POLICY IF EXISTS "Admin: View admin_logs" ON public.admin_logs;
CREATE POLICY "Admin: View admin_logs" ON public.admin_logs FOR SELECT USING ( is_admin() );

DROP POLICY IF EXISTS "Admin: View security_logs" ON public.security_logs;
CREATE POLICY "Admin: View security_logs" ON public.security_logs FOR SELECT USING ( is_admin() );
