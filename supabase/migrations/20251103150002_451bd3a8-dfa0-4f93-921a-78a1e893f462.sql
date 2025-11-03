-- Add shipping_cost column to products table
ALTER TABLE public.products
ADD COLUMN shipping_cost numeric DEFAULT 0;

-- Add comment to explain the column
COMMENT ON COLUMN public.products.shipping_cost IS 'Frais de livraison spécifiques pour ce produit (MAD). Si 0, les frais par ville seront appliqués.';