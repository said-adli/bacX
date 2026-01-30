-- Emergency Fix: Assign VIP Plan to subscribed users with NULL plan_id
-- Created: 2026-01-30 23:12:00
-- Context: Admin user has is_subscribed=true but legacy data ignored plan_id.

DO $$
DECLARE
    target_plan_id uuid;
BEGIN
    -- 1. Ensure is_subscribed column exists (Fixing the "column does not exist" error)
    -- It seems the remote DB is missing this column, despite code relying on it.
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_subscribed') THEN
        ALTER TABLE public.profiles ADD COLUMN is_subscribed BOOLEAN DEFAULT false;
    END IF;

    -- 2. Find VIP Plan
    SELECT id INTO target_plan_id
    FROM public.subscription_plans 
    WHERE name ILIKE '%VIP%' OR name ILIKE '%سنوي%'
    LIMIT 1;

    -- Fallback
    IF target_plan_id IS NULL THEN
        SELECT id INTO target_plan_id
        FROM public.subscription_plans
        WHERE is_active = true
        ORDER BY price DESC
        LIMIT 1;
    END IF;

    -- 3. Update Profiles
    IF target_plan_id IS NOT NULL THEN
        -- Link existing subscribed users to the plan
        -- Use EXECUTE to avoid analysis error since column might have just been added
        EXECUTE format('UPDATE public.profiles SET plan_id = %L WHERE is_subscribed = true AND plan_id IS NULL', target_plan_id);
    END IF;
END $$;
