-- Migration: Performance Optimization (Indexes)
-- Description: Adds B-Tree indexes to critical columns to prevent Timeout errors.

-- 1. Optimize Profiles Table (The most critical one)
-- Speed up checking subscription status (Jumping to plan_id instantly)
CREATE INDEX IF NOT EXISTS idx_profiles_plan_id ON public.profiles (plan_id);

-- Speed up Login & Auth lookups (Finding user by email)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);

-- Speed up Wilaya lookups (Since you are joining with wilayas)
CREATE INDEX IF NOT EXISTS idx_profiles_wilaya_id ON public.profiles (wilaya_id);

-- 2. Optimize Plans Table
-- Ensure we quickly find "Active" plans without scanning archived ones
-- Table is named 'subscription_plans'
CREATE INDEX IF NOT EXISTS idx_plans_is_active ON public.subscription_plans (is_active);

-- 3. Optimize Subjects/Content Table
-- Only create indexes if the columns exist in the subjects table
DO $$
BEGIN
    -- Index on is_active if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'subjects' AND column_name = 'is_active') THEN
        CREATE INDEX IF NOT EXISTS idx_subjects_is_active ON public.subjects (is_active);
    END IF;
    
    -- Index on name if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'subjects' AND column_name = 'name') THEN
        CREATE INDEX IF NOT EXISTS idx_subjects_name ON public.subjects(name);
    END IF;
    
    -- Index on order_index if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'subjects' AND column_name = 'order_index') THEN
        CREATE INDEX IF NOT EXISTS idx_subjects_order_index ON public.subjects(order_index);
    END IF;
    
    -- Index on created_at if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'subjects' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_subjects_created_at ON public.subjects(created_at);
    END IF;
END $$;

