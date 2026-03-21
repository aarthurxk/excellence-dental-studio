
CREATE TABLE public.before_after_cases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  detail text NOT NULL DEFAULT '',
  before_image text NOT NULL DEFAULT '',
  after_image text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.before_after_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active before_after_cases"
  ON public.before_after_cases FOR SELECT TO public
  USING (true);

CREATE POLICY "Admins can manage before_after_cases"
  ON public.before_after_cases FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER update_before_after_cases_updated_at
  BEFORE UPDATE ON public.before_after_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
