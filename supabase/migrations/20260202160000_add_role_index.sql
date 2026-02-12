-- Migration: Add index on profiles(role)
-- Purpose: Optimize admin queries filtering by student role

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
