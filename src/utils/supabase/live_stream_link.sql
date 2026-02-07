-- ============================================
-- MIGRATION: Link Live Streams to Lessons
-- ============================================

-- 1. Add lesson_id column to live_sessions
ALTER TABLE public.live_sessions 
ADD COLUMN IF NOT EXISTS lesson_id text REFERENCES public.lessons(id) ON DELETE SET NULL;

-- 2. Create Index for performance
CREATE INDEX IF NOT EXISTS idx_live_sessions_lesson_id ON public.live_sessions(lesson_id);

-- 3. Optional: Add constraint to ensure lesson type is 'live_stream' if linked?
-- Skipping for flexibility, but good practice in strict schema.

-- 4. Grant access if needed (RLS policies usually cover access via SELECT)

COMMENT ON COLUMN public.live_sessions.lesson_id IS 'Link to the parent lesson content.';
