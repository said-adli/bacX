-- ADD NOTIFICATION COLUMNS TO PROFILES --

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS notify_email BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS notify_sms BOOLEAN DEFAULT FALSE;

-- Ensure RLS allows users to update their own preferences (if policy not already broad enough)
-- This is a precautionary step, existing policies likely cover "UPDATE ON profiles FOR SELF"
-- No explicit policy change needed if standard RLS is in place.
