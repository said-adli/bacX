-- Create security_logs table
CREATE TABLE IF NOT EXISTS security_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT,
    ip_address TEXT,
    attempt_path TEXT,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add last_session_id to profiles for Anti-Sharing
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_session_id UUID;

-- Enable RLS on security_logs
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Allow insert from service role (admin) and authenticated users (audit own actions? mostly service role for middleware)
-- Actually, middleware uses service_role mostly for logging if user is not auth, but here we might log auth failures.
-- Let's allow anon insert for now if we want to log unauth attempts, but ideally middleware uses service key if possible.
-- Since middleware runs on edge, better to just allow insert for public if we want to log generic attacks, 
-- but for this specific "Admin Security Audit", it is likely logged when we know the user or at least the email.
-- Let's keep it simple: allow all for now, or restrict. 
-- Best practice: function wrapper or service role.
-- For simplicity in this stack:
DROP POLICY IF EXISTS "Enable insert for everyone" ON security_logs;
CREATE POLICY "Enable insert for everyone" ON security_logs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable select for admins only" ON security_logs;
CREATE POLICY "Enable select for admins only" ON security_logs FOR SELECT USING (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);
