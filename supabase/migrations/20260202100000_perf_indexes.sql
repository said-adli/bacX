-- Migration: Fix Performance Bottlenecks identified in Audit
-- Description: Adds missing indexes to prevent table scans and ensure fast upserts.

-- 1. Fix 'getUserProgress' filtered query scan
-- Problem: Scanning `lessons` table to find IDs for a subject was slow.
CREATE INDEX IF NOT EXISTS idx_lessons_subject_id ON public.lessons(subject_id);

-- 2. Fix 'markLessonComplete' upsert performance
-- Problem: `ON CONFLICT(user_id, lesson_id)` requires a unique index/constraint to be efficient.
-- We use a unique index which acts as a constraint and an index simultaneously.
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_progress_user_lesson ON public.user_progress(user_id, lesson_id);

-- 3. Optimization: Index for completed_at for potentially sorting progress history
CREATE INDEX IF NOT EXISTS idx_user_progress_completed_at ON public.user_progress(completed_at);
