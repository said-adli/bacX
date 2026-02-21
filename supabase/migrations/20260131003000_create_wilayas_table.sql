-- 1. Create the Wilayas table (Only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.wilayas (
    id SERIAL PRIMARY KEY,
    name_ar TEXT,
    name_en TEXT NOT NULL,
    code TEXT NOT NULL
);

-- 2. Schema Standardization (Handle existing table variations)
DO $$
BEGIN
    -- Ensure code column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wilayas' AND column_name = 'code') THEN
        ALTER TABLE public.wilayas ADD COLUMN code TEXT;
        -- We will populate it in the INSERT/UPDATE step
    END IF;

    -- Ensure name_en exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wilayas' AND column_name = 'name_en') THEN
        ALTER TABLE public.wilayas ADD COLUMN name_en TEXT;
    END IF;

     -- Ensure name_ar exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wilayas' AND column_name = 'name_ar') THEN
        ALTER TABLE public.wilayas ADD COLUMN name_ar TEXT;
    END IF;

    -- Remove conflicting 'name' column if it exists and causes issues (assuming we want name_en/name_ar)
    -- We'll rename it to name_en if name_en is empty, or just drop it if we are re-seeding.
    -- Since we are re-seeding, dropping is safer to avoid NOT NULL constraints on a column we don't use.
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wilayas' AND column_name = 'name') THEN
        ALTER TABLE public.wilayas DROP COLUMN "name";
    END IF;

    -- Handle legacy 'full_label' column - drop the NOT NULL constraint or the column itself
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wilayas' AND column_name = 'full_label') THEN
        ALTER TABLE public.wilayas ALTER COLUMN full_label DROP NOT NULL;
    END IF;
END $$;

-- 3. Enable RLS (and allow public read access)
ALTER TABLE public.wilayas ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wilayas' AND policyname = 'Allow public read access') THEN
        CREATE POLICY "Allow public read access" ON public.wilayas FOR SELECT USING (true);
    END IF;
END $$;

-- 4. Insert the 58 Wilayas (Generating code from ID)
INSERT INTO public.wilayas (id, code, name_en, name_ar)
SELECT 
    v.id, 
    TO_CHAR(v.id, 'FM00'), 
    v.name_en, 
    v.name_ar
FROM (VALUES
    (1, 'Adrar', 'أدرار'),
    (2, 'Chlef', 'الشلف'),
    (3, 'Laghouat', 'الأغواط'),
    (4, 'Oum El Bouaghi', 'أم البواقي'),
    (5, 'Batna', 'باتنة'),
    (6, 'Béjaïa', 'بجاية'),
    (7, 'Biskra', 'بسكرة'),
    (8, 'Béchar', 'بشار'),
    (9, 'Blida', 'البليدة'),
    (10, 'Bouira', 'البويرة'),
    (11, 'Tamanrasset', 'تمنراست'),
    (12, 'Tébessa', 'تبسة'),
    (13, 'Tlemcen', 'تلمسان'),
    (14, 'Tiaret', 'تيارت'),
    (15, 'Tizi Ouzou', 'تيزي وزو'),
    (16, 'Algiers', 'الجزائر'),
    (17, 'Djelfa', 'الجلفة'),
    (18, 'Jijel', 'جيجل'),
    (19, 'Sétif', 'سطيف'),
    (20, 'Saïda', 'سعيدة'),
    (21, 'Skikda', 'سكيكدة'),
    (22, 'Sidi Bel Abbès', 'سيدي بلعباس'),
    (23, 'Annaba', 'عنابة'),
    (24, 'Guelma', 'قالمة'),
    (25, 'Constantine', 'قسنطينة'),
    (26, 'Médéa', 'المدية'),
    (27, 'Mostaganem', 'مستغانم'),
    (28, 'M''Sila', 'المسيلة'),
    (29, 'Mascara', 'معسكر'),
    (30, 'Ouargla', 'ورقلة'),
    (31, 'Oran', 'وهران'),
    (32, 'El Bayadh', 'البيض'),
    (33, 'Illizi', 'إليزي'),
    (34, 'Bordj Bou Arréridj', 'برج بوعريريج'),
    (35, 'Boumerdès', 'بومرداس'),
    (36, 'El Tarf', 'الطرف'),
    (37, 'Tindouf', 'تندوف'),
    (38, 'Tissemsilt', 'تيسمسيلت'),
    (39, 'El Oued', 'الوادي'),
    (40, 'Khenchela', 'خنشلة'),
    (41, 'Souk Ahras', 'سوق أهراس'),
    (42, 'Tipaza', 'تيبازة'),
    (43, 'Mila', 'ميلة'),
    (44, 'Aïn Defla', 'عين الدفلى'),
    (45, 'Naâma', 'نعامة'),
    (46, 'Aïn Témouchent', 'عين تموشنت'),
    (47, 'Ghardaïa', 'غرداية'),
    (48, 'Relizane', 'غليزان'),
    (49, 'El M''Ghair', 'المغير'),
    (50, 'El Meniaa', 'المنيعة'),
    (51, 'Ouled Djellal', 'أولاد جلال'),
    (52, 'Bordj Baji Mokhtar', 'برج باجي مختار'),
    (53, 'Béni Abbès', 'بني عباس'),
    (54, 'Timimoun', 'تيميمون'),
    (55, 'Touggourt', 'تقرت'),
    (56, 'Djanet', 'جانت'),
    (57, 'In Salah', 'عين صالح'),
    (58, 'In Guezzam', 'عين قزام')
) AS v(id, name_en, name_ar)
ON CONFLICT (id) DO UPDATE SET 
    name_en = EXCLUDED.name_en, 
    name_ar = EXCLUDED.name_ar,
    code = EXCLUDED.code;

-- 5. Update Profiles Table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'wilaya_id') THEN
        ALTER TABLE public.profiles ADD COLUMN wilaya_id INTEGER REFERENCES public.wilayas(id);
    END IF;
END $$;

-- 6. Migrate existing data (Optional Best Effort)
UPDATE public.profiles
SET wilaya_id = wilaya::INTEGER
WHERE wilaya_id IS NULL 
  AND wilaya ~ '^[0-9]+$'; -- Only update if string is purely numeric

-- 7. Grant Permissions
GRANT SELECT ON public.wilayas TO anon, authenticated, service_role;
