-- Migration: Fix Security Logs RLS & Add Device Management
-- Security Requirement: Only Service Role can insert logs. Public inserts are blocked.

-- 1. Drop existing dangerous policy (if it matches the one we found)
DROP POLICY IF EXISTS "Enable insert for everyone" ON public.security_logs;
DROP POLICY IF EXISTS "Enable select for admins only" ON public.security_logs;

-- 2. Create STRICT Insert Policy
-- Only service_role can insert.
DROP POLICY IF EXISTS "Service Role Only Insert" ON public.security_logs;
CREATE POLICY "Service Role Only Insert" ON public.security_logs 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- 3. Create Admin Select Policy
DROP POLICY IF EXISTS "Admin Select Only" ON public.security_logs;
CREATE POLICY "Admin Select Only" ON public.security_logs 
FOR SELECT 
USING (
  exists (
    select 1 from public.profiles 
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- 4. Enable RLS
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- 5. Add active_devices column to profiles (for multiple device tracking)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS active_devices JSONB[] DEFAULT '{}';

-- 6. Add access policy for profiles (Users can view own, Admins view all)
-- Assuming profiles RLS exists, but let's ensure we can update our own devices via Edge Function (Service Role)
-- Edge Function bypasses RLS, so no new policy needed for update if using service_role.
-- But we want users to SEE their devices.
-- Existing policies likely cover Select own.
