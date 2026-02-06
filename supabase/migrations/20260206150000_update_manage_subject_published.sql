-- ============================================
-- MIGRATION: 20260206150000_update_manage_subject_published.sql
-- PURPOSE: Update manage_subject RPC to support 'published' flag.
-- ============================================

CREATE OR REPLACE FUNCTION manage_subject(
  p_name TEXT,
  p_icon TEXT DEFAULT 'Folder',
  p_operation_type TEXT DEFAULT 'create', -- 'create' | 'update'
  p_subject_id UUID DEFAULT NULL,
  p_order INTEGER DEFAULT 0,
  p_published BOOLEAN DEFAULT TRUE -- Auto-publish by default
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
  -- ============================================
  -- SECURITY CHECK
  -- ============================================
  SELECT role INTO v_user_role
  FROM profiles
  WHERE id = auth.uid();

  IF v_user_role IS NULL OR v_user_role != 'admin' THEN
    RAISE EXCEPTION 'Access Denied: Only administrators can manage subjects.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- ============================================
  -- OPERATION: CREATE
  -- ============================================
  IF p_operation_type = 'create' THEN
    IF EXISTS (SELECT 1 FROM subjects WHERE name = p_name) THEN
      RAISE EXCEPTION 'Duplicate Error: A subject with name "%" already exists.', p_name
        USING ERRCODE = 'unique_violation';
    END IF;

    INSERT INTO subjects (name, icon, "order", published, created_at)
    VALUES (p_name, p_icon, p_order, p_published, NOW())
    RETURNING id INTO v_result_id;

  -- ============================================
  -- OPERATION: UPDATE
  -- ============================================
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
      "order" = COALESCE(p_order, "order"),
      published = COALESCE(p_published, published)
    WHERE id = p_subject_id
    RETURNING id INTO v_result_id;

  ELSE
    RAISE EXCEPTION 'Invalid operation_type: %. Must be "create" or "update".', p_operation_type
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  RETURN v_result_id;
END;
$$;
