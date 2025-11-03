-- Create product_media table for images and videos
CREATE TABLE public.product_media (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url text NOT NULL,
  is_primary boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view product media"
  ON public.product_media
  FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage product media"
  ON public.product_media
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for product media
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-media', 'product-media', true);

-- Storage policies for product media
CREATE POLICY "Anyone can view product media files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-media');

CREATE POLICY "Admin can upload product media"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'product-media' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can update product media"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'product-media' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can delete product media"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'product-media' AND has_role(auth.uid(), 'admin'::app_role));

-- Create index for better performance
CREATE INDEX idx_product_media_product_id ON public.product_media(product_id);
CREATE INDEX idx_product_media_is_primary ON public.product_media(product_id, is_primary);