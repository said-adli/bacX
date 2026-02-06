-- Add is_lifetime column to coupons
ALTER TABLE public.coupons 
ADD COLUMN IF NOT EXISTS is_lifetime BOOLEAN DEFAULT FALSE;

-- Task 1: Universal Type Sync (The ID Alignment)
-- payment_requests
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_requests' AND column_name = 'content_id') THEN
        -- Drop potential FK constraints to avoid type mismatch errors
        ALTER TABLE payment_requests DROP CONSTRAINT IF EXISTS payment_requests_content_id_fkey;
        
        -- Change to TEXT
        ALTER TABLE payment_requests ALTER COLUMN content_id TYPE TEXT;
    ELSE
        ALTER TABLE payment_requests ADD COLUMN content_id TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_requests' AND column_name = 'content_type') THEN
        ALTER TABLE payment_requests ADD COLUMN content_type TEXT CHECK (content_type IN ('lesson', 'subject'));
    END IF;
END $$;

-- user_content_ownership
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_content_ownership' AND column_name = 'content_id') THEN
        ALTER TABLE user_content_ownership ALTER COLUMN content_id TYPE TEXT;
    END IF;
END $$;

-- live_interactions
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'live_interactions' AND column_name = 'content_id') THEN
        ALTER TABLE live_interactions ALTER COLUMN content_id TYPE TEXT;
    END IF;
END $$;

-- Allow plan_id to be nullable
ALTER TABLE payment_requests ALTER COLUMN plan_id DROP NOT NULL;

-- Task 4: Atomic Approval & Lifetime Ownership (RPC)
CREATE OR REPLACE FUNCTION approve_content_purchase(
    p_request_id UUID,
    p_admin_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_user_id UUID;
    v_content_id TEXT;
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

    -- 2. Update Payment Status
    UPDATE payment_requests
    SET status = 'approved',
        processed_at = NOW(),
        processed_by = p_admin_id
    WHERE id = p_request_id;

    -- 3. Grant Ownership (Lifetime)
    INSERT INTO user_content_ownership (user_id, content_id, content_type, access_level)
    VALUES (v_user_id, v_content_id, v_content_type, 'lifetime')
    ON CONFLICT (user_id, content_id) DO UPDATE 
    SET access_level = 'lifetime', updated_at = NOW();
    
    -- 4. Increment Coupon Usage
    IF v_coupon_code IS NOT NULL THEN
        UPDATE coupons
        SET used_count = used_count + 1
        WHERE code = v_coupon_code;
    END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
