-- Add is_lifetime column to coupons
ALTER TABLE public.coupons 
ADD COLUMN IF NOT EXISTS is_lifetime BOOLEAN DEFAULT FALSE;

-- Add content fields to payment_requests (Safe Block)
DO $$ 
BEGIN
    -- Check if content_id exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_requests' AND column_name = 'content_id') THEN
        -- Drop constraint if it exists (to avoid conflicts during type change)
        ALTER TABLE payment_requests DROP CONSTRAINT IF EXISTS payment_requests_content_id_fkey;
        
        -- Change type to TEXT (using explicit cast if necessary, though unlikely to have UUID data that matches TEXT logic yet)
        -- We cast to text just in case there's data, though "content_id" usually stores IDs.
        ALTER TABLE payment_requests ALTER COLUMN content_id TYPE TEXT;
    ELSE
        -- Add column as TEXT
        ALTER TABLE payment_requests ADD COLUMN content_id TEXT;
    END IF;

    -- Add content_type if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_requests' AND column_name = 'content_type') THEN
        ALTER TABLE payment_requests ADD COLUMN content_type TEXT CHECK (content_type IN ('lesson', 'subject'));
    END IF;
    
    -- Re-apply Foreign Key Constraint
    -- Check if constraint exists effectively by trying to add it, or we can just rely on the fact we dropped it above.
    -- However, if we are in the ELSE block (new column), we just add it.
    -- To be safe, we'll just add it using standard syntax which might fail if duplicate? 
    -- Actually, safer to do it outside or check existence. 
    -- But since we dropped it above if col existed, we can just add it.
    
    BEGIN
        ALTER TABLE payment_requests 
        ADD CONSTRAINT payment_requests_content_id_fkey 
        FOREIGN KEY (content_id) REFERENCES lessons(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN
        NULL; -- Constraint already exists
    END;
END $$;

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
    v_content_id TEXT; -- Changed to TEXT
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
