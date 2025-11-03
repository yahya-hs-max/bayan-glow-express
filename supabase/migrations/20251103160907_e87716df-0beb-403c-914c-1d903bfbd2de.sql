-- Add rating field to products table
ALTER TABLE public.products ADD COLUMN rating numeric DEFAULT 4.5 CHECK (rating >= 0 AND rating <= 5);