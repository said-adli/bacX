-- Table: public.hero_slides
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    image_url TEXT NOT NULL,
    title TEXT,
    cta_link TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- Policy: Public can read active slides
CREATE POLICY "Public can read active slides" ON public.hero_slides
    FOR SELECT TO public
    USING (is_active = true);

-- Policy: Authenticated users (Admin will use Server Role) can manage
CREATE POLICY "Admins can manage slides" ON public.hero_slides
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create a storage bucket for hero images if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('hero-images', 'hero-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Public can view hero images
CREATE POLICY "Public can view hero images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hero-images');

-- Storage Policy: Authenticated users can upload hero images
CREATE POLICY "Authenticated users can upload hero images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hero-images');

-- Storage Policy: Authenticated users can update hero images
CREATE POLICY "Authenticated users can update hero images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'hero-images');

-- Storage Policy: Authenticated users can delete hero images
CREATE POLICY "Authenticated users can delete hero images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'hero-images');
