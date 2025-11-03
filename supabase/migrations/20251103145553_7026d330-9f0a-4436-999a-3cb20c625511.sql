-- Allow anyone (including anonymous users) to create orders
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow anyone to create order items
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
CREATE POLICY "Anyone can create order items"
ON public.order_items
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow public to read orders by order_number (for confirmation page)
CREATE POLICY "Public can read orders by order_number"
ON public.orders
FOR SELECT
TO anon, authenticated
USING (true);