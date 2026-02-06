-- Add is_lifetime column to coupons
ALTER TABLE public.coupons 
ADD COLUMN IF NOT EXISTS is_lifetime BOOLEAN DEFAULT FALSE;
