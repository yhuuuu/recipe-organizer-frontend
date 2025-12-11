-- Recipe Organizer Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Create the recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image TEXT,
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  steps TEXT[] NOT NULL DEFAULT '{}',
  cuisine TEXT NOT NULL,
  sourceUrl TEXT,
  rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  isWishlisted BOOLEAN DEFAULT false,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on cuisine for faster filtering
CREATE INDEX IF NOT EXISTS idx_recipes_cuisine ON recipes(cuisine);

-- Create an index on isWishlisted for faster wishlist queries
CREATE INDEX IF NOT EXISTS idx_recipes_wishlisted ON recipes(isWishlisted);

-- Enable Row Level Security (optional, for multi-user support)
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations (adjust based on your auth needs)
-- For single-user or public access:
DROP POLICY IF EXISTS "Allow all operations" ON recipes;
CREATE POLICY "Allow all operations" ON recipes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- For authenticated users only (uncomment if you add auth):
-- DROP POLICY IF EXISTS "Allow authenticated users" ON recipes;
-- CREATE POLICY "Allow authenticated users" ON recipes
--   FOR ALL
--   USING (auth.role() = 'authenticated')
--   WITH CHECK (auth.role() = 'authenticated');

