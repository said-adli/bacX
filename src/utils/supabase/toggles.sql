-- FINAL MISSION: CLEAN SLATE TOGGLE FIX
-- ==========================================

-- 1. DROP EVERYTHING (Scorched Earth Policy)
-- Drop every possible signature of this function to remove "Ambiguous Function" errors.
DROP FUNCTION IF EXISTS public.toggle_resource_status(text, uuid, text, boolean);
DROP FUNCTION IF EXISTS public.toggle_resource_status(text, text, boolean);
DROP FUNCTION IF EXISTS public.toggle_resource_status(text, text, text, boolean);

-- 2. CREATE THE DEFINITIVE VERSION
-- Using clear parameter names that match the RPC call keys directly.
CREATE OR REPLACE FUNCTION public.toggle_resource_status(
    resource_id TEXT, 
    resource_type TEXT, 
    new_status BOOLEAN
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
    CASE resource_type
        WHEN 'subject' THEN 
            v_target_table := 'subjects';
            v_target_column := 'published';
        WHEN 'lesson' THEN 
            v_target_table := 'lessons';
            -- Check for 'published' first, fallback to 'is_public' logic
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'published') THEN
                v_target_column := 'published';
            ELSE
                 v_target_column := 'is_public';
            END IF;
        WHEN 'user' THEN 
            v_target_table := 'profiles';
            v_target_column := 'is_banned'; 
        WHEN 'coupon' THEN 
            v_target_table := 'coupons';
            v_target_column := 'is_active';
        ELSE 
            RAISE EXCEPTION 'Invalid resource type: %', resource_type;
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
    USING new_status, resource_id;

END;
$$;
