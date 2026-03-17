-- ============================================
-- MIGRATION: Admin RPC Architecture & Subject Management
-- Timestamp: 20260201190000
-- ============================================

-- ============================================
-- 1. FUNCTION: manage_subject
-- Purpose: Create or Update subjects with admin-only access
-- ============================================

CREATE OR REPLACE FUNCTION manage_subject(
  p_name TEXT,
  p_icon TEXT DEFAULT 'Folder',
  p_operation_type TEXT DEFAULT 'create', -- 'create' | 'update'
  p_subject_id UUID DEFAULT NULL,
  p_order INTEGER DEFAULT 0
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with function owner's privileges
SET search_path = public
AS $$
DECLARE
  v_user_role TEXT;
  v_result_id UUID;
BEGIN
  -- Security: Verify Admin
  SELECT role INTO v_user_role FROM profiles WHERE id = auth.uid();

  IF v_user_role IS NULL OR v_user_role != 'admin' THEN
    RAISE EXCEPTION 'Access Denied: Only administrators can manage subjects.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- Create
  IF p_operation_type = 'create' THEN
    IF EXISTS (SELECT 1 FROM subjects WHERE name = p_name) THEN
      RAISE EXCEPTION 'Duplicate Error: A subject with name "%" already exists.', p_name
        USING ERRCODE = 'unique_violation';
    END IF;

    INSERT INTO subjects (name, icon, "order", created_at)
    VALUES (p_name, p_icon, p_order, NOW())
    RETURNING id INTO v_result_id;

  -- Update
  ELSIF p_operation_type = 'update' THEN
    IF p_subject_id IS NULL THEN
      RAISE EXCEPTION 'Validation Error: subject_id is required for update operation.'
        USING ERRCODE = 'invalid_parameter_value';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM subjects WHERE id = p_subject_id) THEN
      RAISE EXCEPTION 'Not Found: Subject with id "%" does not exist.', p_subject_id
        USING ERRCODE = 'no_data_found';
    END IF;

    IF EXISTS (SELECT 1 FROM subjects WHERE name = p_name AND id != p_subject_id) THEN
      RAISE EXCEPTION 'Duplicate Error: A subject with name "%" already exists.', p_name
        USING ERRCODE = 'unique_violation';
    END IF;

    UPDATE subjects
    SET 
      name = COALESCE(p_name, name),
      icon = COALESCE(p_icon, icon),
      "order" = COALESCE(p_order, "order")
    WHERE id = p_subject_id
    RETURNING id INTO v_result_id;

  ELSE
    RAISE EXCEPTION 'Invalid operation_type: %. Must be "create" or "update".', p_operation_type
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  RETURN v_result_id;
END;
$$;

GRANT EXECUTE ON FUNCTION manage_subject TO authenticated;
COMMENT ON FUNCTION manage_subject IS 'Admin-only RPC to create or update subjects.';

-- ============================================
-- 2. TABLE: platform_updates
-- ============================================

CREATE TABLE IF NOT EXISTS public.platform_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'feature', -- 'feature' | 'bugfix' | 'announcement' | 'maintenance'
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.platform_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published updates"
    ON public.platform_updates FOR SELECT
    USING (is_published = true);

-- ============================================
-- 3. FUNCTION: manage_announcement
-- ============================================

CREATE OR REPLACE FUNCTION manage_announcement(
    p_operation TEXT,
    p_title TEXT DEFAULT NULL,
    p_content TEXT DEFAULT NULL,
    p_is_active BOOLEAN DEFAULT true,
    p_announcement_id UUID DEFAULT NULL
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
        RAISE EXCEPTION 'Access Denied: Admin privileges required.' USING ERRCODE = 'insufficient_privilege';
    END IF;

    IF p_operation = 'create' THEN
        IF p_content IS NULL THEN
            RAISE EXCEPTION 'Content is required.' USING ERRCODE = 'invalid_parameter_value';
        END IF;
        INSERT INTO announcements (title, content, is_active, created_at)
        VALUES (p_title, p_content, p_is_active, NOW())
        RETURNING id INTO v_result_id;

    ELSIF p_operation = 'update' THEN
        IF p_announcement_id IS NULL THEN
            RAISE EXCEPTION 'announcement_id is required.' USING ERRCODE = 'invalid_parameter_value';
        END IF;
        UPDATE announcements
        SET title = COALESCE(p_title, title),
            content = COALESCE(p_content, content),
            is_active = COALESCE(p_is_active, is_active)
        WHERE id = p_announcement_id
        RETURNING id INTO v_result_id;
        IF v_result_id IS NULL THEN
             RAISE EXCEPTION 'Announcement not found.' USING ERRCODE = 'no_data_found';
        END IF;

    ELSIF p_operation = 'delete' THEN
        IF p_announcement_id IS NULL THEN
            RAISE EXCEPTION 'announcement_id is required.' USING ERRCODE = 'invalid_parameter_value';
        END IF;
        DELETE FROM announcements WHERE id = p_announcement_id
        RETURNING id INTO v_result_id;
        IF v_result_id IS NULL THEN
             RAISE EXCEPTION 'Announcement not found.' USING ERRCODE = 'no_data_found';
        END IF;

    ELSE
        RAISE EXCEPTION 'Invalid operation: %.', p_operation USING ERRCODE = 'invalid_parameter_value';
    END IF;

    RETURN v_result_id;
END;
$$;

GRANT EXECUTE ON FUNCTION manage_announcement TO authenticated;

-- ============================================
-- 4. FUNCTION: manage_plan
-- ============================================

CREATE OR REPLACE FUNCTION manage_plan(
    p_operation TEXT,
    p_name TEXT DEFAULT NULL,
    p_price NUMERIC DEFAULT NULL,
    p_discount_price NUMERIC DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_features JSONB DEFAULT NULL,
    p_is_active BOOLEAN DEFAULT true,
    p_duration_days INTEGER DEFAULT 30,
    p_type TEXT DEFAULT 'subscription',
    p_plan_id UUID DEFAULT NULL
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
        RAISE EXCEPTION 'Access Denied: Admin privileges required.' USING ERRCODE = 'insufficient_privilege';
    END IF;

    IF p_operation = 'create' THEN
        IF p_name IS NULL OR p_price IS NULL THEN
            RAISE EXCEPTION 'Name and price are required.' USING ERRCODE = 'invalid_parameter_value';
        END IF;
        INSERT INTO subscription_plans (
            name, price, discount_price, description, 
            features, is_active, duration_days, type, created_at
        )
        VALUES (
            p_name, p_price, p_discount_price, p_description,
            COALESCE(p_features, '[]'::jsonb), p_is_active, p_duration_days, p_type, NOW()
        )
        RETURNING id INTO v_result_id;

    ELSIF p_operation = 'update' THEN
        IF p_plan_id IS NULL THEN
            RAISE EXCEPTION 'plan_id is required.' USING ERRCODE = 'invalid_parameter_value';
        END IF;
        UPDATE subscription_plans
        SET name = COALESCE(p_name, name),
            price = COALESCE(p_price, price),
            discount_price = COALESCE(p_discount_price, discount_price),
            description = COALESCE(p_description, description),
            features = COALESCE(p_features, features),
            is_active = COALESCE(p_is_active, is_active),
            duration_days = COALESCE(p_duration_days, duration_days),
            type = COALESCE(p_type, type)
        WHERE id = p_plan_id
        RETURNING id INTO v_result_id;
        IF v_result_id IS NULL THEN
            RAISE EXCEPTION 'Plan not found.' USING ERRCODE = 'no_data_found';
        END IF;

    ELSIF p_operation = 'delete' THEN
        IF p_plan_id IS NULL THEN
            RAISE EXCEPTION 'plan_id is required.' USING ERRCODE = 'invalid_parameter_value';
        END IF;
        DELETE FROM subscription_plans WHERE id = p_plan_id
        RETURNING id INTO v_result_id;
        IF v_result_id IS NULL THEN
            RAISE EXCEPTION 'Plan not found.' USING ERRCODE = 'no_data_found';
        END IF;

    ELSE
        RAISE EXCEPTION 'Invalid operation: %.', p_operation USING ERRCODE = 'invalid_parameter_value';
    END IF;

    RETURN v_result_id;
END;
$$;

GRANT EXECUTE ON FUNCTION manage_plan TO authenticated;

-- ============================================
-- 5. FUNCTION: manage_user_ban
-- ============================================

CREATE OR REPLACE FUNCTION manage_user_ban(
    p_operation TEXT,
    p_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_admin_role TEXT;
    v_target_role TEXT;
BEGIN
    SELECT role INTO v_admin_role FROM profiles WHERE id = auth.uid();
    IF v_admin_role IS NULL OR v_admin_role != 'admin' THEN
        RAISE EXCEPTION 'Access Denied: Admin privileges required.' USING ERRCODE = 'insufficient_privilege';
    END IF;

    SELECT role INTO v_target_role FROM profiles WHERE id = p_user_id;
    IF v_target_role IS NULL THEN
        RAISE EXCEPTION 'User not found.' USING ERRCODE = 'no_data_found';
    END IF;

    IF v_target_role = 'admin' THEN
        RAISE EXCEPTION 'Cannot ban admin users.' USING ERRCODE = 'insufficient_privilege';
    END IF;

    IF p_operation = 'ban' THEN
        UPDATE profiles SET is_banned = true WHERE id = p_user_id;
    ELSIF p_operation = 'unban' THEN
        UPDATE profiles SET is_banned = false WHERE id = p_user_id;
    ELSE
        RAISE EXCEPTION 'Invalid operation: %.', p_operation USING ERRCODE = 'invalid_parameter_value';
    END IF;

    RETURN p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION manage_user_ban TO authenticated;

-- ============================================
-- 6. FUNCTION: manage_platform_update
-- ============================================

CREATE OR REPLACE FUNCTION manage_platform_update(
    p_operation TEXT,
    p_title TEXT DEFAULT NULL,
    p_content TEXT DEFAULT NULL,
    p_type TEXT DEFAULT 'feature',
    p_is_published BOOLEAN DEFAULT false,
    p_update_id UUID DEFAULT NULL
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
        RAISE EXCEPTION 'Access Denied: Admin privileges required.' USING ERRCODE = 'insufficient_privilege';
    END IF;

    IF p_operation = 'create' THEN
        IF p_title IS NULL OR p_content IS NULL THEN
            RAISE EXCEPTION 'Title and content are required.' USING ERRCODE = 'invalid_parameter_value';
        END IF;
        INSERT INTO platform_updates (title, content, type, is_published, published_at, created_at)
        VALUES (p_title, p_content, p_type, p_is_published, CASE WHEN p_is_published THEN NOW() ELSE NULL END, NOW())
        RETURNING id INTO v_result_id;

    ELSIF p_operation = 'update' THEN
        IF p_update_id IS NULL THEN
            RAISE EXCEPTION 'update_id is required.' USING ERRCODE = 'invalid_parameter_value';
        END IF;
        UPDATE platform_updates
        SET title = COALESCE(p_title, title),
            content = COALESCE(p_content, content),
            type = COALESCE(p_type, type),
            is_published = COALESCE(p_is_published, is_published),
            published_at = CASE WHEN p_is_published = true AND published_at IS NULL THEN NOW() ELSE published_at END
        WHERE id = p_update_id
        RETURNING id INTO v_result_id;
        IF v_result_id IS NULL THEN
            RAISE EXCEPTION 'Platform update not found.' USING ERRCODE = 'no_data_found';
        END IF;

    ELSIF p_operation = 'delete' THEN
        IF p_update_id IS NULL THEN
            RAISE EXCEPTION 'update_id is required.' USING ERRCODE = 'invalid_parameter_value';
        END IF;
        DELETE FROM platform_updates WHERE id = p_update_id
        RETURNING id INTO v_result_id;
         IF v_result_id IS NULL THEN
            RAISE EXCEPTION 'Platform update not found.' USING ERRCODE = 'no_data_found';
        END IF;

    ELSE
        RAISE EXCEPTION 'Invalid operation: %.', p_operation USING ERRCODE = 'invalid_parameter_value';
    END IF;

    RETURN v_result_id;
END;
$$;

GRANT EXECUTE ON FUNCTION manage_platform_update TO authenticated;
