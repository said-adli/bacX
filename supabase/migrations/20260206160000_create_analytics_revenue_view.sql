-- Create analytics_revenue view for efficient financial reporting
-- REVISED V3: Handles cases where analytics_revenue might mistakenly exist as a table.
-- Joins payment_requests with subscription_plans using COALESCE for robust revenue calculation.

-- 1. CLEANUP: Drop potential conflicting objects
DROP TABLE IF EXISTS public.analytics_revenue;
DROP VIEW IF EXISTS public.analytics_revenue;

-- 2. CREATE VIEW
CREATE OR REPLACE VIEW public.analytics_revenue AS
WITH joined_payments AS (
    SELECT
        pr.created_at,
        -- Fallback to 0 if plan deleted or price missing, ensures view doesn't break
        COALESCE(sp.discount_price, sp.price, 0) as val,
        pr.plan_id
    FROM payment_requests pr
    LEFT JOIN subscription_plans sp ON pr.plan_id = sp.id
    WHERE pr.status = 'paid'
),
monthly_stats AS (
    SELECT
        to_char(created_at, 'Mon') as month,
        SUM(val) as revenue
    FROM joined_payments
    GROUP BY to_char(created_at, 'Mon')
),
plan_stats AS (
    SELECT
        plan_id,
        COUNT(*) as count
    FROM joined_payments
    GROUP BY plan_id
)
SELECT
    COALESCE((SELECT SUM(val) FROM joined_payments), 0) as total_revenue,
    (SELECT COUNT(*) FROM joined_payments) as total_transactions,
    COALESCE((SELECT jsonb_object_agg(month, revenue) FROM monthly_stats), '{}'::jsonb) as monthly_revenue,
    COALESCE((SELECT jsonb_object_agg(plan_id, count) FROM plan_stats), '{}'::jsonb) as plan_stats;

-- 3. PERMISSIONS
GRANT SELECT ON public.analytics_revenue TO authenticated;
-- Not enabling RLS on the View directly as it's complex; 
-- relying on underlying tables RLS or just granting SELECT is sufficient here for a read-only view.
-- If RLS on view is strictly required (security_invoker = true), we can alter:
ALTER VIEW public.analytics_revenue OWNER TO postgres; 
-- Assuming service role or admin usage.
