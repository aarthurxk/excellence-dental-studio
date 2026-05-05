
-- 1. user_profiles table
CREATE TABLE public.user_profiles (
  user_id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  phone text DEFAULT '',
  avatar_url text DEFAULT '',
  job_title text DEFAULT '',
  department text DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  notes text DEFAULT '',
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view profiles"
  ON public.user_profiles FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Admins can insert profiles"
  ON public.user_profiles FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete profiles"
  ON public.user_profiles FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins or owner can update profile"
  ON public.user_profiles FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()) OR auth.uid() = user_id)
  WITH CHECK (public.is_admin(auth.uid()) OR auth.uid() = user_id);

CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Auto-create profile on new auth user
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- 3. Backfill perfis para usuários já existentes
INSERT INTO public.user_profiles (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- 4. Permissões padrão da Secretaria
INSERT INTO public.role_permissions (role, module, can_view, can_edit, can_delete) VALUES
  ('secretaria', 'messages', true, true, false),
  ('secretaria', 'messages_audit', true, false, false),
  ('secretaria', 'testimonials', true, false, false),
  ('secretaria', 'services', true, false, false),
  ('secretaria', 'dentists', true, false, false),
  ('secretaria', 'videos', true, false, false),
  ('secretaria', 'events', true, true, false),
  ('secretaria', 'about', true, false, false),
  ('secretaria', 'features', true, false, false),
  ('secretaria', 'roadmap', true, false, false),
  ('secretaria', 'before_after', true, false, false),
  ('secretaria', 'settings', false, false, false),
  ('secretaria', 'users', false, false, false)
ON CONFLICT DO NOTHING;
