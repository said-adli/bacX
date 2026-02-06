-- CLEAN SLATE FIX: Drop ALL ambiguous versions of toggle_resource_status
DROP FUNCTION IF EXISTS public.toggle_resource_status(text, uuid, text, boolean);
DROP FUNCTION IF EXISTS public.toggle_resource_status(text, text, boolean);

-- Create the DEFINITIVE version
CREATE OR REPLACE FUNCTION public.toggle_resource_status(
    resource_id TEXT, 
    resource_type TEXT, 
    new_status BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_table TEXT;
    target_column TEXT;
    is_valid_type BOOLEAN := FALSE;
BEGIN
    -- 1. Map Resource Type to Table Name
    CASE resource_type
        WHEN 'subject' THEN target_table := 'subjects';
        WHEN 'unit' THEN target_table := 'units'; -- Units might not have a toggle, but harmless to map
        WHEN 'lesson' THEN target_table := 'lessons';
        WHEN 'user' THEN target_table := 'profiles';
        WHEN 'coupon' THEN target_table := 'coupons';
        ELSE RAISE EXCEPTION 'Invalid resource type: %', resource_type;
    END CASE;

    -- 2. Determine Target Column (Dynamic Check)
    -- Check if 'published' exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = target_table 
          AND column_name = 'published'
    ) THEN
        target_column := 'published';
    -- Check if 'is_active' exists
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = target_table 
          AND column_name = 'is_active'
    ) THEN
        target_column := 'is_active';
    ELSE
        RAISE EXCEPTION 'No toggleable column (published/is_active) found for table: %', target_table;
    END IF;

    -- 3. Execute Update Securely
    EXECUTE format('UPDATE public.%I SET %I = $1 WHERE id = $2::uuid', target_table, target_column)
    USING new_status, resource_id;

END;
$$;
