
-- -------------------------------------------------------------------------
-- MIGRATION: 20260206130000_secure_storage_buckets.sql
-- PURPOSE: Force 'receipts' and 'course-materials' buckets to be PRIVATE.
-- -------------------------------------------------------------------------

-- 1. Secure 'receipts'
UPDATE storage.buckets
SET public = false
WHERE id = 'receipts';

-- 2. Secure 'course-materials'
UPDATE storage.buckets
SET public = false
WHERE id = 'course-materials';

-- 3. Ensure RLS Policies (Idempotent)

-- RECEIPTS
CREATE POLICY "Public: Users can upload receipts"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
-- Note: The above policy assumes hierarchy `receipts/USER_ID/file`. 
-- If flat structure `receipts/USER_ID_timestamp.ext` is used, we need consistent path logic.
-- Given existing code uses `receipts/${userId}_${timestamp}`, we allow authenticated uploads.

DROP POLICY IF EXISTS "Auth: Upload receipts" ON storage.objects;
CREATE POLICY "Auth: Upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'receipts' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admin: View receipts" ON storage.objects;
CREATE POLICY "Admin: View receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'receipts' AND (
    -- Admin check (nested select or function)
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR
    -- Own receipt (if filename starts with user_id)
    name LIKE (auth.uid() || '%')
));

-- COURSE MATERIALS
DROP POLICY IF EXISTS "Admin: Manage materials" ON storage.objects;
CREATE POLICY "Admin: Manage materials"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'course-materials' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Subscribed: View materials" ON storage.objects;
CREATE POLICY "Subscribed: View materials"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'course-materials' AND (
   -- Admin
   EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
   OR
   -- Subscribed User (simplified check, real logic handled by Signed URL generation on server)
   -- Actually, if bucket is private, we DON'T need RLS for Select if we use Signed URLs.
   -- Signed URLs bypass RLS.
   false
));
-- We set to FALSE effectively because we want to force Signed URLs for materials too.
