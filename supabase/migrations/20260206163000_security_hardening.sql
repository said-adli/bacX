-- ============================================
-- MIGRATION: 20260206163000_security_hardening.sql
-- PURPOSE: Unified Access Control & RLS Hardening
-- 1. Create `user_subscriptions` view for strict RLS
-- 2. Add `required_plan_id` and `published` to `live_sessions`
-- 3. Rewrite RLS for `lessons` and `live_sessions`
-- ============================================

-- 1. Create `user_subscriptions` view
-- This view maps users to their active plans, simplifying RLS and preventing logic duplication.
CREATE OR REPLACE VIEW user_subscriptions AS
SELECT 
    id as user_id, 
    plan_id, 
    'active'::text as status 
FROM profiles 
WHERE is_subscribed = true;

-- 2. Update `live_sessions` table
ALTER TABLE live_sessions 
ADD COLUMN IF NOT EXISTS required_plan_id UUID REFERENCES subscription_plans(id),
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false;

-- Create index for performance
CREATE INDEX IF NOT EXISTS live_sessions_published_idx ON live_sessions(published);
CREATE INDEX IF NOT EXISTS live_sessions_plan_idx ON live_sessions(required_plan_id);

-- 3. RLS Hardening

-- A. Live Sessions
ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Public read live" ON live_sessions;
DROP POLICY IF EXISTS "Auth Read Live Sessions" ON live_sessions;
DROP POLICY IF EXISTS "Admins Manage Live" ON live_sessions;
DROP POLICY IF EXISTS "Subscribers Read Live" ON live_sessions;
DROP POLICY IF EXISTS "Admin Manage Live" ON live_sessions;

-- Admin Policy (Full Access)
CREATE POLICY "Admin Manage Live" ON live_sessions
FOR ALL
USING (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and (profiles.role = 'admin' OR profiles.role = 'teacher')
  )
);

-- Subscriber Policy (Strict Plan Match & Published Check)
CREATE POLICY "Student Read Live" ON live_sessions
FOR SELECT
USING (
  published = true
  AND
  exists (
    select 1 from user_subscriptions us
    where us.user_id = auth.uid()
    and us.plan_id = live_sessions.required_plan_id
    and us.status = 'active'
  )
);

-- B. Lessons hardending
-- We need to ensure lessons also follow the "Iron Curtain" rule.
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Drop insecure policies
DROP POLICY IF EXISTS "Subscribers can view lessons" ON lessons;
DROP POLICY IF EXISTS "Public can view free lessons" ON lessons;
-- (Keep admin policies if they exist, or recreate them to be safe)
DROP POLICY IF EXISTS "Admins can manage lessons" ON lessons;

-- Admin Policy
CREATE POLICY "Admins Manage Lessons" ON lessons
FOR ALL
USING (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and (profiles.role = 'admin' OR profiles.role = 'teacher')
  )
);

-- Student Policy (Plan Match OR Free)
-- Note: Lessons don't inherently have a "published" flag themselves often, 
-- they inherit from Subject/Unit usually. 
-- BUT, if we want to be safe, we assume the application layer checks parents.
-- RLS here strictly checks the Plan Match.
CREATE POLICY "Student Read Lessons" ON lessons
FOR SELECT
USING (
  (is_free = true)
  OR
  exists (
    select 1 from user_subscriptions us
    where us.user_id = auth.uid()
    and us.plan_id = lessons.required_plan_id
    and us.status = 'active'
  )
);
