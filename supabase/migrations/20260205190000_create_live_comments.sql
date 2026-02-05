-- ============================================
-- MIGRATION: Live Comments Table
-- Timestamp: 20260205190000
-- ============================================

CREATE TABLE IF NOT EXISTS public.live_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    content TEXT NOT NULL,
    role TEXT DEFAULT 'student',
    is_question BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.live_comments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read comments"
    ON public.live_comments FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert comments"
    ON public.live_comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admin can delete (optional/future)
-- Indexes
CREATE INDEX IF NOT EXISTS idx_live_comments_created_at ON public.live_comments(created_at DESC);
