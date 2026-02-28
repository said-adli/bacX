-- MIGRATION: 20260221145000_add_null_checks_to_rpcs.sql
-- PURPOSE: Ensure RPCs handling IDs have a strict check to prevent undefined or null operations

-- 1. Update toggle_resource_status
DROP FUNCTION IF EXISTS public.toggle_resource_status(text,text,boolean);
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
    -- Mandatory Guard Clause
    IF resource_id IS NULL OR resource_id = 'undefined' THEN
        RETURN;
    END IF;

    CASE resource_type
        WHEN 'subject' THEN
            v_target_table := 'subjects';
            v_target_column := 'is_active';
        WHEN 'lesson' THEN
            v_target_table := 'lessons';
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'is_active') THEN
                v_target_column := 'is_active';
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

    EXECUTE format('UPDATE public.%I SET %I = $1 WHERE id = $2::uuid', v_target_table, v_target_column)
    USING new_status, resource_id;
END;
$$;

-- 2. Update manage_subject
DROP FUNCTION IF EXISTS public.manage_subject(TEXT, TEXT, TEXT, UUID, INTEGER, BOOLEAN);
DROP FUNCTION IF EXISTS public.manage_subject(TEXT, TEXT, TEXT, UUID, INTEGER);
CREATE OR REPLACE FUNCTION manage_subject(
    p_name TEXT,
    p_icon TEXT DEFAULT 'Folder',
    p_operation_type TEXT DEFAULT 'create',
    p_subject_id UUID DEFAULT NULL,
    p_order INTEGER DEFAULT 0,
    p_is_active BOOLEAN DEFAULT TRUE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_role TEXT;
    v_result_id UUID;
BEGIN
    SELECT role INTO v_user_role FROM profiles WHERE id = auth.uid();
    IF v_user_role IS NULL OR v_user_role != 'admin' THEN
        RAISE EXCEPTION 'Access Denied: Only administrators can manage subjects.' USING ERRCODE = 'insufficient_privilege';
    END IF;

    IF p_operation_type = 'create' THEN
        INSERT INTO subjects (name, icon, "order", is_active, created_at)
        VALUES (p_name, p_icon, p_order, p_is_active, NOW())
        RETURNING id INTO v_result_id;
    ELSIF p_operation_type = 'update' THEN
        -- Mandatory Guard Clause
        IF p_subject_id IS NULL THEN
            RETURN NULL;
        END IF;

        UPDATE subjects SET
            name = COALESCE(p_name, name),
            icon = COALESCE(p_icon, icon),
            "order" = COALESCE(p_order, "order"),
            is_active = COALESCE(p_is_active, is_active)
        WHERE id = p_subject_id
        RETURNING id INTO v_result_id;
    ELSE
        RAISE EXCEPTION 'Invalid operation_type: %', p_operation_type;
    END IF;

    RETURN v_result_id;
END;
$$;
