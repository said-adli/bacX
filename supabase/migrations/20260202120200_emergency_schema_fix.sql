-- Migration: Emergency Schema Fix
-- Created: 2026-01-31
-- Description: Fixes critical schema drift for profiles (subscription_end_date) and wilayas (localization).

-- 1. Profiles: Add subscription_end_date (with timezone for safety)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'subscription_end_date'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN subscription_end_date TIMESTAMPTZ;
    END IF;
END $$;

-- 2. Wilayas: Enhance for Localization (name_ar, name_en)
-- Create table if it doesn't exist (defensive)
CREATE TABLE IF NOT EXISTS public.wilayas (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    code text,
    name text,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add localized name columns
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'wilayas' 
        AND column_name = 'name_ar'
    ) THEN
        ALTER TABLE public.wilayas 
        ADD COLUMN name_ar TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'wilayas' 
        AND column_name = 'name_en'
    ) THEN
        ALTER TABLE public.wilayas 
        ADD COLUMN name_en TEXT;
    END IF;
END $$;

-- 3. Subscription Plans: Ensure Basic Structure Exists
-- This prevents foreign key errors if referenced by profiles.plan_id
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    price numeric NOT NULL,
    discount_price numeric,
    description text,
    features text[],
    is_active boolean DEFAULT true,
    duration_days integer DEFAULT 365,
    type text DEFAULT 'subscription',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Profiles: Plan ID Link Check
-- Ensure plan_id column exists on profiles and references subscription_plans
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'plan_id'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN plan_id uuid REFERENCES public.subscription_plans(id);
    END IF;
END $$;
