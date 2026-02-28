-- Migration: Student Requests (Unified Request Management)
-- Date: 2026-01-31
-- Purpose: Centralized table for Profile Updates and Account Deletion requests

-- 1. Create the student_requests table
CREATE TABLE IF NOT EXISTS public.student_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Request Type: 'UPDATE_PROFILE' or 'DELETE_ACCOUNT'
    request_type TEXT NOT NULL CHECK (request_type IN ('UPDATE_PROFILE', 'DELETE_ACCOUNT')),
    
    -- Payload: Contains new profile data (for updates) or null (for deletion)
    payload JSONB,
    
    -- Workflow status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    
    -- Admin note (rejection reason)
    admin_note TEXT,
    
    -- Admin who processed the request
    processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    processed_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_requests_user_id ON public.student_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_student_requests_status ON public.student_requests(status);
CREATE INDEX IF NOT EXISTS idx_student_requests_type ON public.student_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_student_requests_created_at ON public.student_requests(created_at DESC);

-- 3. Enable RLS
ALTER TABLE public.student_requests ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Users can INSERT their own requests
DROP POLICY IF EXISTS "Users can create their own requests" ON public.student_requests;
CREATE POLICY "Users can create their own requests"
ON public.student_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can SELECT only their own requests
DROP POLICY IF EXISTS "Users can view their own requests" ON public.student_requests;
CREATE POLICY "Users can view their own requests"
ON public.student_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can SELECT all requests (for admin panel)
DROP POLICY IF EXISTS "Admins can view all requests" ON public.student_requests;
CREATE POLICY "Admins can view all requests"
ON public.student_requests
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Admins can UPDATE all requests (approve/reject)
DROP POLICY IF EXISTS "Admins can update all requests" ON public.student_requests;
CREATE POLICY "Admins can update all requests"
ON public.student_requests
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- 5. Updated_at trigger
CREATE OR REPLACE FUNCTION update_student_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_student_requests_updated_at ON public.student_requests;
CREATE TRIGGER trigger_update_student_requests_updated_at
    BEFORE UPDATE ON public.student_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_student_requests_updated_at();

-- 6. Add comment for documentation
COMMENT ON TABLE public.student_requests IS 'Unified table for student profile update and account deletion requests';
COMMENT ON COLUMN public.student_requests.request_type IS 'Type of request: UPDATE_PROFILE or DELETE_ACCOUNT';
COMMENT ON COLUMN public.student_requests.payload IS 'JSON containing new profile data for UPDATE_PROFILE, null for DELETE_ACCOUNT';
COMMENT ON COLUMN public.student_requests.admin_note IS 'Reason for rejection, written by admin';
