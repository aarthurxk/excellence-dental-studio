
CREATE TABLE public.section_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  event_type text NOT NULL,
  section_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.section_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can insert section events"
  ON public.section_events FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Admins can read section events"
  ON public.section_events FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE INDEX idx_section_events_created ON public.section_events(created_at DESC);
CREATE INDEX idx_section_events_section ON public.section_events(section_name, event_type);

CREATE OR REPLACE FUNCTION public.analytics_section_engagement()
RETURNS TABLE(section_name text, views bigint, clicks bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    se.section_name,
    count(*) FILTER (WHERE se.event_type = 'view') AS views,
    count(*) FILTER (WHERE se.event_type = 'click') AS clicks
  FROM public.section_events se
  WHERE se.created_at >= now() - interval '30 days'
  GROUP BY se.section_name
  ORDER BY views DESC;
$$;
