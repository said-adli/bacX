-- Migration: System Settings for Realtime Sync
-- 1. Create table
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Public Read (Authenticated & Anon) - needed for realtime
DROP POLICY IF EXISTS "Public read system settings" ON public.system_settings;
CREATE POLICY "Public read system settings" ON public.system_settings FOR SELECT USING (true);

-- Admin Write
DROP POLICY IF EXISTS "Admin write system settings" ON public.system_settings;
CREATE POLICY "Admin write system settings" ON public.system_settings FOR ALL USING (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- 4. Insert Defaults
INSERT INTO public.system_settings (key, value) VALUES 
('maintenance_mode', 'false'::jsonb),
('live_mode', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 5. Enable Realtime for this table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'system_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.system_settings;
  END IF;
END;
$$;
