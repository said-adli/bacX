-- ============================================
-- MIGRATION: 20260206140000_payment_idempotency.sql
-- PURPOSE: Prevent duplicate payment requests using idempotency_key
-- ============================================

-- 1. Add Idempotency Key Column
ALTER TABLE public.payment_requests
ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;

-- 2. Add Index for performance
CREATE INDEX IF NOT EXISTS idx_payment_requests_idempotency ON public.payment_requests(idempotency_key);
