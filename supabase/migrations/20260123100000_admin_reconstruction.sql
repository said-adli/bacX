-- Migration: Admin Reconstruction v2 Support (FIXED)
-- Creates missing tables if they don't exist, then adds columns.

-- 1. Create subscription_plans table if not exists
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  discount_price NUMERIC,
  description TEXT,
  features TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  duration_days INTEGER DEFAULT 30,
  type TEXT DEFAULT 'subscription' CHECK (type IN ('subscription', 'course'))
);

-- Enable RLS for subscription_plans
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Plan Policies
DROP POLICY IF EXISTS "Public read access for plans" ON public.subscription_plans;
CREATE POLICY "Public read access for plans" ON public.subscription_plans FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full access for plans" ON public.subscription_plans;
CREATE POLICY "Admin full access for plans" ON public.subscription_plans FOR ALL USING (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- 2. Create payment_receipts table (for Manual Activation)
CREATE TABLE IF NOT EXISTS public.payment_receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  receipt_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  plan_id UUID REFERENCES public.subscription_plans(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for payment_receipts
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;

-- Receipt Policies
DROP POLICY IF EXISTS "Users can upload receipts" ON public.payment_receipts;
CREATE POLICY "Users can upload receipts" ON public.payment_receipts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own receipts" ON public.payment_receipts;
CREATE POLICY "Users can view own receipts" ON public.payment_receipts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all receipts" ON public.payment_receipts;
CREATE POLICY "Admins can view all receipts" ON public.payment_receipts FOR SELECT USING (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

DROP POLICY IF EXISTS "Admins can update receipts" ON public.payment_receipts;
CREATE POLICY "Admins can update receipts" ON public.payment_receipts FOR UPDATE USING (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- 3. Update lessons table for Granular Access Control
-- Ensure lessons table exists (it should, but safety first)
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    unit_id UUID,
    type TEXT,
    video_url TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add the column
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS required_plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL;

-- 4. Create global_notifications table
CREATE TABLE IF NOT EXISTS public.global_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS for global_notifications
ALTER TABLE public.global_notifications ENABLE ROW LEVEL SECURITY;

-- Notification Policies
DROP POLICY IF EXISTS "Public read access for notifications" ON public.global_notifications;
CREATE POLICY "Public read access for notifications" ON public.global_notifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full access for notifications" ON public.global_notifications;
CREATE POLICY "Admin full access for notifications" ON public.global_notifications FOR ALL USING (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);
