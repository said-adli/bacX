-- Add content fields to payment_requests
ALTER TABLE payment_requests
ADD COLUMN IF NOT EXISTS content_id UUID REFERENCES lessons(id) ON DELETE SET NULL, -- Could verify subject too, but loose coupling is okay or use generic ID
ADD COLUMN IF NOT EXISTS content_type TEXT CHECK (content_type IN ('lesson', 'subject'));

-- Allow plan_id to be nullable (if not already)
ALTER TABLE payment_requests ALTER COLUMN plan_id DROP NOT NULL;

-- RPC to approve content purchase
CREATE OR REPLACE FUNCTION approve_content_purchase(
    p_request_id UUID,
    p_admin_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_user_id UUID;
    v_content_id UUID;
    v_content_type TEXT;
BEGIN
    -- 1. Get request details
    SELECT user_id, content_id, content_type
    INTO v_user_id, v_content_id, v_content_type
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

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
