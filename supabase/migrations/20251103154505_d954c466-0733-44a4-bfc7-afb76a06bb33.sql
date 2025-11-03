-- Assign admin role to yahyahoussini366@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('8c39de86-0eae-4fb8-88f8-1ab76c6a81d8', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;