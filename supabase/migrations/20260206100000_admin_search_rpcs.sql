-- ============================================
-- MIGRATION: Admin Search RPCs + Private Storage
-- Timestamp: 20260206100000
-- Purpose: Add search_students/count_students RPCs + make receipts private
-- ============================================

-- 1. Make receipts bucket private (if not already)
UPDATE storage.buckets 
SET public = false 
WHERE id = 'receipts';

-- 2. Performance Indexes for Admin Operations
CREATE INDEX IF NOT EXISTS idx_profiles_role_created_at 
    ON public.profiles(role, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_full_name_search 
    ON public.profiles(full_name varchar_pattern_ops);

CREATE INDEX IF NOT EXISTS idx_profiles_email_search 
    ON public.profiles(email varchar_pattern_ops);

-- 3. RPC: search_students
-- Secure, paginated student search with admin-only access
CREATE OR REPLACE FUNCTION public.search_students(
    p_query TEXT DEFAULT '',
    p_page INTEGER DEFAULT 1,
    p_page_size INTEGER DEFAULT 10,
    p_filter TEXT DEFAULT 'all'
)
RETURNS SETOF public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_role TEXT;
    v_offset INTEGER;
    v_safe_query TEXT;
BEGIN
    -- Security: Verify Admin
    SELECT role INTO v_user_role FROM profiles WHERE id = auth.uid();
    
    IF v_user_role IS NULL OR v_user_role != 'admin' THEN
        RAISE EXCEPTION 'Access Denied: Admin privileges required.' 
            USING ERRCODE = 'insufficient_privilege';
    END IF;
    
    -- Calculate offset
    v_offset := (p_page - 1) * p_page_size;
    
    -- Sanitize query (basic server-side cleanup, client should also sanitize)
    v_safe_query := COALESCE(TRIM(p_query), '');
    
    -- Return results based on filter
    IF v_safe_query = '' THEN
        -- No search query - return paginated students
        RETURN QUERY
        SELECT *
        FROM profiles
        WHERE role = 'student'
            AND (p_filter = 'all' 
                OR (p_filter = 'active' AND is_subscribed = true)
                OR (p_filter = 'expired' AND is_subscribed = false)
                OR (p_filter = 'banned' AND is_banned = true))
        ORDER BY created_at DESC
        LIMIT p_page_size
        OFFSET v_offset;
    ELSE
        -- With search query - prefix match for index usage
        RETURN QUERY
        SELECT *
        FROM profiles
        WHERE role = 'student'
            AND (full_name ILIKE v_safe_query || '%' OR email ILIKE v_safe_query || '%')
            AND (p_filter = 'all' 
                OR (p_filter = 'active' AND is_subscribed = true)
                OR (p_filter = 'expired' AND is_subscribed = false)
                OR (p_filter = 'banned' AND is_banned = true))
        ORDER BY created_at DESC
        LIMIT p_page_size
        OFFSET v_offset;
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_students TO authenticated;
COMMENT ON FUNCTION public.search_students IS 'Admin-only RPC for secure, paginated student search.';

-- 4. RPC: count_students
-- Get total count for pagination
CREATE OR REPLACE FUNCTION public.count_students(
    p_query TEXT DEFAULT '',
    p_filter TEXT DEFAULT 'all'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_role TEXT;
    v_safe_query TEXT;
    v_count INTEGER;
BEGIN
    -- Security: Verify Admin
    SELECT role INTO v_user_role FROM profiles WHERE id = auth.uid();
    
    IF v_user_role IS NULL OR v_user_role != 'admin' THEN
        RAISE EXCEPTION 'Access Denied: Admin privileges required.' 
            USING ERRCODE = 'insufficient_privilege';
    END IF;
    
    -- Sanitize query
    v_safe_query := COALESCE(TRIM(p_query), '');
    
    -- Count results based on filter
    IF v_safe_query = '' THEN
        SELECT COUNT(*) INTO v_count
        FROM profiles
        WHERE role = 'student'
            AND (p_filter = 'all' 
                OR (p_filter = 'active' AND is_subscribed = true)
                OR (p_filter = 'expired' AND is_subscribed = false)
                OR (p_filter = 'banned' AND is_banned = true));
    ELSE
        SELECT COUNT(*) INTO v_count
        FROM profiles
        WHERE role = 'student'
            AND (full_name ILIKE v_safe_query || '%' OR email ILIKE v_safe_query || '%')
            AND (p_filter = 'all' 
                OR (p_filter = 'active' AND is_subscribed = true)
                OR (p_filter = 'expired' AND is_subscribed = false)
                OR (p_filter = 'banned' AND is_banned = true));
    END IF;
    
    RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.count_students TO authenticated;
COMMENT ON FUNCTION public.count_students IS 'Admin-only RPC for counting students in search results.';
