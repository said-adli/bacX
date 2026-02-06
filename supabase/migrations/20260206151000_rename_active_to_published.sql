-- ============================================
-- MIGRATION: 20260206151000_rename_active_to_published.sql
-- PURPOSE: Rename is_active to published to standardize visibility logic.
-- ============================================

DO $$
BEGIN
  -- Check if column exists before renaming to avoid errors
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subjects' AND column_name = 'is_active') THEN
    ALTER TABLE subjects RENAME COLUMN is_active TO published;
  END IF;

  -- Ensure default is TRUE (Auto-Publish) if not set, or preserve existing.
  -- Add index for published column if not exists
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'subjects' AND indexname = 'subjects_published_idx') THEN
    CREATE INDEX subjects_published_idx ON subjects (published);
  END IF;
END $$;
