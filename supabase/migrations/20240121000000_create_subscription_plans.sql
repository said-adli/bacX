-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    discount_price NUMERIC, -- Optional discounted price
    description TEXT,
    features TEXT[], -- Array of strings for features
    is_active BOOLEAN DEFAULT true, -- Soft delete / hide
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Policies
-- Everyone can read active plans
CREATE POLICY "Public can view active plans" 
ON subscription_plans FOR SELECT 
USING (is_active = true);

-- Admins can view all plans (including inactive)
CREATE POLICY "Admins can view all plans" 
ON subscription_plans FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Admins can insert/update/delete
CREATE POLICY "Admins can manage plans" 
ON subscription_plans FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);
