-- Fix: Add missing Foreign Key relationship between profile_change_requests and profiles
ALTER TABLE public.profile_change_requests
ADD CONSTRAINT fk_profile_change_requests_user
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Reload the PostgREST schema cache so the API recognizes the new relationship
NOTIFY pgrst, 'reload schema';
