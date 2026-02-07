-- Fix Payment Requests Schema
-- Adds missing plan_id column required by Admin RPC and Analytics

ALTER TABLE public.payment_requests 
ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES public.subscription_plans(id);

-- Optional: If subscription_requests exists and has data, we might want to migrate it here.
-- But since we can't easily check for its existence in standard SQL without erroring if missing,
-- we'll skip auto-migration and focus on fixing the forward flow.
