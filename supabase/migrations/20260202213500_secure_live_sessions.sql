-- Enable RLS (Ensure it is on)
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

-- DROP EXISTING POLICIES (Clean Slate)
DROP POLICY IF EXISTS "Public read live" ON public.live_sessions;
DROP POLICY IF EXISTS "Auth Read Live Sessions" ON public.live_sessions;
DROP POLICY IF EXISTS "Admins Manage Live" ON public.live_sessions;

-- 1. Admin Policy: Full Access
CREATE POLICY "Admin Manage Live" ON public.live_sessions
FOR ALL
USING (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

-- 2. Subscriber Policy: Read Only
-- A user can see the live session ONLY if they are subscribed.
CREATE POLICY "Subscribers Read Live" ON public.live_sessions
FOR SELECT
USING (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.is_subscribed = true
  )
);
