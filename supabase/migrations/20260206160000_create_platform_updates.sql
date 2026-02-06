-- ============================================
-- MIGRATION: 20260206160000_create_platform_updates.sql
-- PURPOSE: Create platform_updates table for system changelogs.
-- ============================================

CREATE TABLE IF NOT EXISTS platform_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    version TEXT,
    type TEXT DEFAULT 'general', -- 'feature', 'bugfix', 'security'
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE platform_updates ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view published updates" 
ON platform_updates FOR SELECT 
USING (published = true);

CREATE POLICY "Admins can manage updates" 
ON platform_updates FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);
