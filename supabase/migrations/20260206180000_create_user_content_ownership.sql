-- Create user_content_ownership table
CREATE TABLE IF NOT EXISTS user_content_ownership (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    content_id UUID NOT NULL, -- Generic ID (lesson_id, subject_id, etc.)
    content_type TEXT NOT NULL CHECK (content_type IN ('lesson', 'subject', 'live')),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb -- Optional for future proofing (e.g. transaction_id)
);

-- Enable RLS
ALTER TABLE user_content_ownership ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ownership_user_content ON user_content_ownership(user_id, content_id);
CREATE INDEX IF NOT EXISTS idx_ownership_user ON user_content_ownership(user_id);

-- Policies
-- Users can see their own ownerships
CREATE POLICY "Users view own ownership" 
ON user_content_ownership FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Admins can view/manage all
CREATE POLICY "Admins manage ownership" 
ON user_content_ownership FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);
