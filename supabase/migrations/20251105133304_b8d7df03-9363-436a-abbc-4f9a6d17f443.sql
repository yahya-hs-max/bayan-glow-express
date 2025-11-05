-- Create shipping_costs table for dynamic city shipping prices
CREATE TABLE public.shipping_costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city_name TEXT NOT NULL UNIQUE,
  shipping_cost NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shipping_costs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admin can manage shipping costs"
ON public.shipping_costs
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active shipping costs"
ON public.shipping_costs
FOR SELECT
USING (is_active = true);

-- Create product_variants table
CREATE TABLE public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  variant_name TEXT NOT NULL,
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create product_variant_options table
CREATE TABLE public.product_variant_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  variant_id UUID NOT NULL,
  option_name TEXT NOT NULL,
  price_modifier NUMERIC DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on variants
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variant_options ENABLE ROW LEVEL SECURITY;

-- Policies for variants
CREATE POLICY "Admin can manage product variants"
ON public.product_variants
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view product variants"
ON public.product_variants
FOR SELECT
USING (true);

CREATE POLICY "Admin can manage variant options"
ON public.product_variant_options
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active variant options"
ON public.product_variant_options
FOR SELECT
USING (is_active = true);

-- Add variant columns to order_items
ALTER TABLE public.order_items
ADD COLUMN selected_variants JSONB DEFAULT '[]'::jsonb;

-- Add trigger for shipping_costs updated_at
CREATE TRIGGER update_shipping_costs_updated_at
BEFORE UPDATE ON public.shipping_costs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default cities
INSERT INTO public.shipping_costs (city_name, shipping_cost) VALUES
('Casablanca', 30),
('Rabat', 35),
('Marrakech', 40),
('Tanger', 45),
('Fès', 40),
('Agadir', 50);