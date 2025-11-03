-- Drop the existing restrictive policy for inserting roles
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;

-- Create a new policy that allows:
-- 1. Existing admins to insert any role
-- 2. Anyone to insert an admin role if no admins exist yet (for initial setup)
CREATE POLICY "Allow admin role creation"
ON public.user_roles
FOR INSERT
WITH CHECK (
  -- Allow if user is already an admin
  has_role(auth.uid(), 'admin'::app_role)
  OR
  -- Allow initial admin creation if no admins exist
  (
    role = 'admin'::app_role 
    AND user_id = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM public.user_roles WHERE role = 'admin'::app_role
    )
  )
);