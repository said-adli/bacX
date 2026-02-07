-- Migration: Lesson Resources & Storage
-- Description: Adds system for attaching files to lessons and securing them.

-- 1. Create table `lesson_resources`
CREATE TABLE IF NOT EXISTS public.lesson_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id TEXT REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT DEFAULT 'pdf', -- pdf, image, etc.
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.lesson_resources ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for `lesson_resources`

-- Admin: Full Access
DROP POLICY IF EXISTS "Admin full access for lesson_resources" ON public.lesson_resources;
CREATE POLICY "Admin full access for lesson_resources" ON public.lesson_resources
FOR ALL USING (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- Student: SELECT (Read) Only
-- Logic: Authenticated AND (Lesson is Public OR User sends correct Plan OR User is generally Subscribed fallback)
-- Strict Check: Join with Lesson -> Check if Lesson requires Plan -> Check if User has that Plan.
DROP POLICY IF EXISTS "Student read access for lesson_resources" ON public.lesson_resources;
CREATE POLICY "Student read access for lesson_resources" ON public.lesson_resources
FOR SELECT USING (
  auth.role() = 'authenticated' AND (
    EXISTS (
      SELECT 1 FROM public.lessons l
      LEFT JOIN public.profiles p ON p.id = auth.uid()
      WHERE l.id = lesson_resources.lesson_id
      AND (
        -- Case 1: Lesson is free/public (Folded into Case 2: No Pan Required)
        -- l.required_plan_id IS NULL handles it if we assume null plan = public
        l.required_plan_id IS NULL 
        OR
        -- Case 3: User has the specific required plan
        p.active_plan_id = l.required_plan_id
        OR
        -- Case 4: User is globally subscribed (Legacy fallback, if you want to be less strict)
        p.is_subscribed = true 
        OR
        -- Case 5: User is Admin (failsafe)
        p.role = 'admin'
      )
    )
  )
);

-- 4. Storage Bucket Setup
-- Note: Insert this into the 'storage.buckets' table.
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-materials', 'course-materials', false) -- Private Bucket
ON CONFLICT (id) DO UPDATE SET public = false;

-- 5. Storage Policies for `course-materials` bucket

-- Admin: Full Control
DROP POLICY IF EXISTS "Admin full access course-materials" ON storage.objects;
CREATE POLICY "Admin full access course-materials" ON storage.objects
FOR ALL USING (
  bucket_id = 'course-materials' 
  AND exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- Student: Read Only (Strict)
-- We check if the user is subscribed. Validating exact file-to-lesson ownership in Storage RLS is complex/expensive.
-- We rely on the App Level (obfuscated URLs) + Table RLS to hide the filename. 
-- But as a second layer, we ensure only SUBSCRIBED users can download from this bucket.
DROP POLICY IF EXISTS "Subscribed users read course-materials" ON storage.objects;
CREATE POLICY "Subscribed users read course-materials" ON storage.objects
FOR SELECT USING (
  bucket_id = 'course-materials'
  AND auth.role() = 'authenticated'
  AND (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
      and (profiles.is_subscribed = true OR profiles.active_plan_id IS NOT NULL)
    )
  )
);
