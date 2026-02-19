-- ============================================
-- DROP OLD FUNCTION FIRST
-- ============================================
DROP FUNCTION IF EXISTS manage_subject(text, text, text, uuid, integer, boolean);


CREATE OR REPLACE FUNCTION manage_subject(
  p_name TEXT,
  p_icon TEXT DEFAULT 'Folder',
  p_operation_type TEXT DEFAULT 'create', -- 'create' | 'update'
  p_subject_id UUID DEFAULT NULL,
  p_order_index INTEGER DEFAULT 0,
  p_is_active BOOLEAN DEFAULT TRUE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with function owner's privileges
SET search_path = public -- Security best practice
AS $$
DECLARE
  v_user_role TEXT;
  v_result_id UUID;
BEGIN
  -- ============================================
  -- SECURITY CHECK: Verify user is Admin
  -- Uses profiles table (matches project structure)
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
    -- Check for duplicate name
    IF EXISTS (SELECT 1 FROM subjects WHERE name = p_name) THEN
      RAISE EXCEPTION 'Duplicate Error: A subject with name "%" already exists.', p_name
        USING ERRCODE = 'unique_violation';
    END IF;

    INSERT INTO subjects (name, icon, order_index, is_active, created_at)
    VALUES (p_name, p_icon, p_order_index, p_is_active, NOW())
    RETURNING id INTO v_result_id;

  -- ============================================
  -- OPERATION: UPDATE
  -- ============================================
  ELSIF p_operation_type = 'update' THEN
    -- Validate subject_id is provided
    IF p_subject_id IS NULL THEN
      RAISE EXCEPTION 'Validation Error: subject_id is required for update operation.'
        USING ERRCODE = 'invalid_parameter_value';
    END IF;

    -- Check if subject exists
    IF NOT EXISTS (SELECT 1 FROM subjects WHERE id = p_subject_id) THEN
      RAISE EXCEPTION 'Not Found: Subject with id "%" does not exist.', p_subject_id
        USING ERRCODE = 'no_data_found';
    END IF;

    -- Check for duplicate name (excluding current subject)
    IF EXISTS (SELECT 1 FROM subjects WHERE name = p_name AND id != p_subject_id) THEN
      RAISE EXCEPTION 'Duplicate Error: A subject with name "%" already exists.', p_name
        USING ERRCODE = 'unique_violation';
    END IF;

    UPDATE subjects
    SET 
      name = COALESCE(p_name, name),
      icon = COALESCE(p_icon, icon),
      order_index = COALESCE(p_order_index, order_index),
      is_active = COALESCE(p_is_active, is_active)
    WHERE id = p_subject_id
    RETURNING id INTO v_result_id;

  -- ============================================
  -- INVALID OPERATION
  -- ============================================
  ELSE
    RAISE EXCEPTION 'Invalid operation_type: %. Must be "create" or "update".', p_operation_type
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  RETURN v_result_id;
END;
$$;

-- ============================================
-- GRANT EXECUTION PERMISSION
-- ============================================
GRANT EXECUTE ON FUNCTION manage_subject TO authenticated;

-- Optional: Add a comment for documentation
COMMENT ON FUNCTION manage_subject IS 'Admin-only RPC to create or update subjects with active status.';
