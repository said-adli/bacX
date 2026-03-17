-- Migration: Backfill Legacy Plan IDs
-- Created: 2026-01-30
-- Description: Adds plan_id column to profiles and links existing subscribed users to a specific plan.

-- 1. Add plan_id column to profiles if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS plan_id uuid REFERENCES public.subscription_plans(id);

-- 2. Backfill existing subscribed users
-- CRITICAL: REPLACE 'REPLACE_WITH_REAL_UUID' with the actual UUID of the VIP plan from your database.
-- Example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'

DO $$
DECLARE
    target_plan_id uuid;
BEGIN
    -- Dynamically find the VIP plan to avoid hardcoding issues
    SELECT id INTO target_plan_id
    FROM public.subscription_plans 
    WHERE name ILIKE '%VIP%' OR name ILIKE '%سنوي%'
    LIMIT 1;

    -- If no VIP plan found, fallback to ANY active plan (just to ensure data integrity)
    IF target_plan_id IS NULL THEN
        SELECT id INTO target_plan_id
        FROM public.subscription_plans
        WHERE is_active = true
        ORDER BY price DESC
        LIMIT 1;
    END IF;

    -- Only run update if we found a valid plan
    IF target_plan_id IS NOT NULL THEN
        UPDATE public.profiles
        SET plan_id = target_plan_id
        WHERE is_subscribed = true 
        AND plan_id IS NULL;
    END IF;
END $$;
