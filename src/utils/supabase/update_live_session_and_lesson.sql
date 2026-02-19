CREATE OR REPLACE FUNCTION update_live_session_and_lesson(
  p_session_id UUID,
  p_lesson_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_started_at TIMESTAMPTZ,
  p_youtube_id TEXT,
  p_status TEXT DEFAULT NULL,
  p_is_purchasable BOOLEAN DEFAULT NULL,
  p_price NUMERIC DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT NULL,
  p_required_plan_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Update Live Session
  UPDATE live_sessions
  SET
    title = COALESCE(p_title, title),
    description = COALESCE(p_description, description),
    started_at = COALESCE(p_started_at, started_at),
    youtube_id = COALESCE(p_youtube_id, youtube_id),
    status = COALESCE(p_status, status),
    is_purchasable = COALESCE(p_is_purchasable, is_purchasable),
    price = COALESCE(p_price, price),
    is_active = COALESCE(p_is_active, is_active),
    required_plan_id = COALESCE(p_required_plan_id, required_plan_id),
    -- Update lesson_id only if provided explicitly (or keep existing)
    lesson_id = COALESCE(p_lesson_id, lesson_id),
    updated_at = NOW()
  WHERE id = p_session_id;

  -- 2. Update Linked Lesson (if provided)
  IF p_lesson_id IS NOT NULL THEN
    UPDATE lessons
    SET
      title = COALESCE(p_title, title),
      description = COALESCE(p_description, description),
      -- SECURITY FIX: Do NOT update video_url to match youtube_id/stream_url
      -- The lesson should rely on its own logic or the session link.
      -- We ONLY sync metadata (title/desc) to keep the tree looking correct.
      updated_at = NOW()
    WHERE id = p_lesson_id;
  END IF;

  -- 3. Implicit Transaction Commit (Postgres default)
END;
$$;
