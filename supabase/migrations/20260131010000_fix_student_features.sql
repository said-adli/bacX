-- Create student_progress table
CREATE TABLE IF NOT EXISTS public.student_progress (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    lesson_id TEXT REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    last_watched_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, lesson_id)
);

-- Create lesson_notes table
CREATE TABLE IF NOT EXISTS public.lesson_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    lesson_id TEXT REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_notes ENABLE ROW LEVEL SECURITY;

-- Policies for student_progress
-- Policies for student_progress
DROP POLICY IF EXISTS "Users can view their own progress" ON public.student_progress;
CREATE POLICY "Users can view their own progress"
ON public.student_progress FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own progress" ON public.student_progress;
CREATE POLICY "Users can update their own progress"
ON public.student_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can modify their own progress" ON public.student_progress;
CREATE POLICY "Users can modify their own progress"
ON public.student_progress FOR UPDATE
USING (auth.uid() = user_id);

-- Policies for lesson_notes
DROP POLICY IF EXISTS "Users can view their own notes" ON public.lesson_notes;
CREATE POLICY "Users can view their own notes"
ON public.lesson_notes FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create/update their own notes" ON public.lesson_notes;
CREATE POLICY "Users can create/update their own notes"
ON public.lesson_notes FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can modify their own notes" ON public.lesson_notes;
CREATE POLICY "Users can modify their own notes"
ON public.lesson_notes FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notes" ON public.lesson_notes;
CREATE POLICY "Users can delete their own notes"
ON public.lesson_notes FOR DELETE
USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_student_progress_updated_at ON public.student_progress;
CREATE TRIGGER update_student_progress_updated_at
    BEFORE UPDATE ON public.student_progress
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_lesson_notes_updated_at ON public.lesson_notes;
CREATE TRIGGER update_lesson_notes_updated_at
    BEFORE UPDATE ON public.lesson_notes
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
