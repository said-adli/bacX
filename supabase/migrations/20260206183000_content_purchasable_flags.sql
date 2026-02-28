-- Add is_purchasable and price to lessons
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS is_purchasable BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT NULL;

-- Add is_purchasable and price to subjects (if entire subject is purchasable)
ALTER TABLE subjects 
ADD COLUMN IF NOT EXISTS is_purchasable BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT NULL;

-- Add is_purchasable and price to live_sessions
ALTER TABLE live_sessions 
ADD COLUMN IF NOT EXISTS is_purchasable BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT NULL;

-- Update live_sessions to ensure it has required fields for the new UI if missing
-- (Title, YouTube ID are likely there, but verify)
-- live_sessions usually has: id, title, youtube_id, start_time, status, required_plan_id, etc.
