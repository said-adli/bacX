-- Migration: Profile Change Requests (Approval Queue)
-- Date: 2026-01-24
-- Purpose: Allow users to submit profile changes for admin approval

-- 1. Create the status enum
CREATE TYPE profile_change_status AS ENUM ('pending', 'approved', 'rejected');

-- 2. Create the table
CREATE TABLE IF NOT EXISTS public.profile_change_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- The proposed changes as JSON
    new_data JSONB NOT NULL,
    
    -- Workflow status
    status profile_change_status NOT NULL DEFAULT 'pending',
    
    -- Admin who processed the request (null if pending)
    processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    processed_at TIMESTAMPTZ,
    
    -- Rejection reason (optional)
    rejection_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create indexes for performance
CREATE INDEX idx_profile_change_requests_user_id ON public.profile_change_requests(user_id);
CREATE INDEX idx_profile_change_requests_status ON public.profile_change_requests(status);
CREATE INDEX idx_profile_change_requests_created_at ON public.profile_change_requests(created_at DESC);

-- 4. Enable RLS
ALTER TABLE public.profile_change_requests ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Users can INSERT their own requests
CREATE POLICY "Users can create their own change requests"
ON public.profile_change_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can SELECT only their own requests
CREATE POLICY "Users can view their own change requests"
ON public.profile_change_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can SELECT all requests (for admin panel)
CREATE POLICY "Admins can view all change requests"
ON public.profile_change_requests
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Admins can UPDATE all requests (approve/reject)
CREATE POLICY "Admins can update all change requests"
ON public.profile_change_requests
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

-- 6. Updated_at trigger
CREATE OR REPLACE FUNCTION update_profile_change_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_profile_change_requests_updated_at
    BEFORE UPDATE ON public.profile_change_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_change_requests_updated_at();

-- 7. Add notification preferences to profiles table if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'notify_email') THEN
        ALTER TABLE public.profiles ADD COLUMN notify_email BOOLEAN DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'notify_sms') THEN
        ALTER TABLE public.profiles ADD COLUMN notify_sms BOOLEAN DEFAULT false;
    END IF;
END $$;
