
-- Migration: Add Icon to Subjects
-- Created: 2026-01-31
-- Description: Adds 'icon' column to subjects table with a default value.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'subjects' 
        AND column_name = 'icon'
    ) THEN
        ALTER TABLE public.subjects 
        ADD COLUMN icon text DEFAULT 'BookOpen';
    END IF;
END $$;
