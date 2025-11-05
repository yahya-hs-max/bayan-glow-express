-- Add badge_color column to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS badge_color text DEFAULT 'default';