-- ============================================
-- MIGRATION: Admin Audit Logs
-- Purpose: Track sensitive admin actions (God Mode)
-- ============================================

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,          -- e.g., 'IMPERSONATE_USER', 'DELETE_STUDENT'
    target_id UUID,               -- The ID of the object being acted upon
    target_type TEXT,             -- 'user', 'coupon', 'subject'
    details JSONB DEFAULT '{}',    -- Extra context (e.g., old_value, new_value)
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only Admins can INSERT
CREATE POLICY "Admins can insert logs"
    ON public.admin_audit_logs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Only Admins can SELECT (Read Logs)
CREATE POLICY "Admins can view logs"
    ON public.admin_audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Index for searching logs by target or admin
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON admin_audit_logs(target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON admin_audit_logs(created_at DESC);
