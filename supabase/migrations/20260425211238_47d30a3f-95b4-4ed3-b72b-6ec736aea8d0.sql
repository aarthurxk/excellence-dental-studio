-- Catálogo de etiquetas
CREATE TABLE public.lead_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access lead_tags"
ON public.lead_tags FOR ALL TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Atribuições de etiquetas a leads
CREATE TABLE public.lead_tag_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.lead_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (lead_id, tag_id)
);

ALTER TABLE public.lead_tag_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access lead_tag_assignments"
ON public.lead_tag_assignments FOR ALL TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE INDEX idx_lead_tag_assignments_lead ON public.lead_tag_assignments(lead_id);
CREATE INDEX idx_lead_tag_assignments_tag ON public.lead_tag_assignments(tag_id);

-- Seeds iniciais
INSERT INTO public.lead_tags (name, color) VALUES
  ('VIP', '#EF4444'),
  ('Urgente', '#F59E0B'),
  ('Orçamento enviado', '#8B5CF6'),
  ('Implante', '#3B82F6'),
  ('Clareamento', '#10B981'),
  ('Ortodontia', '#EC4899');