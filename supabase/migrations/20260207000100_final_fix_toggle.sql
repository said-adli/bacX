-- FINAL MISSION: CLEAN SLATE TOGGLE FIX
-- ==========================================

-- 1. DROP EVERYTHING (Scorched Earth Policy)
-- Drop every possible signature of this function to remove "Ambiguous Function" errors.
DROP FUNCTION IF EXISTS public.toggle_resource_status(text, uuid, text, boolean);
DROP FUNCTION IF EXISTS public.toggle_resource_status(text, text, boolean);
DROP FUNCTION IF EXISTS public.toggle_resource_status(text, text, text, boolean); -- User's error report implies this might exist

-- 2. CREATE THE DEFINITIVE VERSION
-- Use p_ prefixes to prevent "Ambiguous Column" errors.
CREATE OR REPLACE FUNCTION public.toggle_resource_status(
    p_resource_id TEXT, 
    p_resource_type TEXT, 
    p_new_status BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_target_table TEXT;
    v_target_column TEXT;
BEGIN
    -- 1. Strict Type Mapping
    CASE p_resource_type
        WHEN 'subject' THEN 
            v_target_table := 'subjects';
            v_target_column := 'published';  -- Confirmed via migration
        WHEN 'lesson' THEN 
            v_target_table := 'lessons';
            -- Check for 'published' first, fallback to 'is_public' logic is tricky in pure SQL without dynamic checks
            -- But we can just prioritize 'published' if it exists, else 'is_public'
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'published') THEN
                v_target_column := 'published';
            ELSE
                 v_target_column := 'is_public'; -- Fallback for lessons
            END IF;
        WHEN 'user' THEN 
            v_target_table := 'profiles';
            v_target_column := 'is_banned'; -- Note: Logic inversion might be needed (toggle status usually means SET ACTIVE. If p_new_status is TRUE (active), is_banned should be FALSE).
            -- However, usually the UI passes "new state". If UI says "Banned: true", we set is_banned=true.
            -- If UI says "Active: true", we set is_banned=false.
            -- Let's assume input matches the column semantics for now to avoid confusion, or standard "is_active" semantics.
            -- For simplicity and complying with "toggle status", we assume p_new_status is the TARGET value for the column.
        WHEN 'coupon' THEN 
            v_target_table := 'coupons';
            v_target_column := 'is_active';
        ELSE 
            RAISE EXCEPTION 'Invalid resource type: %', p_resource_type;
    END CASE;

    -- 2. Validate Column Exists (Double Check)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = v_target_table 
          AND column_name = v_target_column
    ) THEN
        RAISE EXCEPTION 'Column %.% does not exist.', v_target_table, v_target_column;
    END IF;

    -- 3. Execute Update
    -- Casting ID to uuid explicitly to ensure type match
    EXECUTE format('UPDATE public.%I SET %I = $1 WHERE id = $2::uuid', v_target_table, v_target_column)
    USING p_new_status, p_resource_id;

END;
$$;
