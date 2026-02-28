-- Fix Coupon Leak: Increment used_count on payment approval atomically

CREATE OR REPLACE FUNCTION approve_payment_transaction(
  p_request_id uuid,
  p_admin_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_plan_id uuid;
  v_duration_days int;
  v_coupon_code text;
BEGIN
  -- 1. Fetch Plan Info from payment_requests
  SELECT user_id, plan_id, coupon_code INTO v_user_id, v_plan_id, v_coupon_code
  FROM payment_requests
  WHERE id = p_request_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Payment request not found';
  END IF;

  -- Fetch duration from subscription_plans (default 30 days)
  SELECT duration_days INTO v_duration_days
  FROM subscription_plans
  WHERE id = v_plan_id;

  IF v_duration_days IS NULL THEN
    v_duration_days := 30;
  END IF;

  -- 2. Update Request (Audit Trail)
  UPDATE payment_requests
  SET 
    status = 'approved',
    reviewed_by = p_admin_id,
    reviewed_at = now()
  WHERE id = p_request_id;
  
  -- 3. Update Profile (Grant Access)
  UPDATE profiles
  SET 
    is_subscribed = true,
    plan_id = v_plan_id,
    subscription_end_date = (now() + (v_duration_days || ' days')::interval)
  WHERE id = v_user_id;

  -- 4. Atomically increment the coupon usage if one was used
  IF v_coupon_code IS NOT NULL THEN
    UPDATE coupons
    SET used_count = used_count + 1
    WHERE code = v_coupon_code;
  END IF;

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION approve_content_purchase(
    p_request_id UUID,
    p_admin_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_user_id UUID;
    v_content_id UUID;
    v_content_type TEXT;
    v_coupon_code TEXT;
BEGIN
    -- 1. Get request details
    SELECT user_id, content_id, content_type, coupon_code
    INTO v_user_id, v_content_id, v_content_type, v_coupon_code
    FROM payment_requests
    WHERE id = p_request_id;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Request not found';
    END IF;

    -- 2. Update Status
    UPDATE payment_requests
    SET status = 'approved',
        processed_at = NOW(),
        processed_by = p_admin_id
    WHERE id = p_request_id;

    -- 3. Grant Ownership
    INSERT INTO user_content_ownership (user_id, content_id, content_type, access_level)
    VALUES (v_user_id, v_content_id, v_content_type, 'lifetime')
    ON CONFLICT (user_id, content_id) DO NOTHING;

    -- 4. Atomically increment the coupon usage if one was used
    IF v_coupon_code IS NOT NULL THEN
        UPDATE coupons
        SET used_count = used_count + 1
        WHERE code = v_coupon_code;
    END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
