
-- Helper function for analytics access
CREATE OR REPLACE FUNCTION public.can_view_analytics(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'socio', 'agencia')
  )
$$;

-- Allow agencia to read traffic_sessions
DROP POLICY IF EXISTS "Admins can read traffic sessions" ON public.traffic_sessions;
CREATE POLICY "Analytics users can read traffic sessions"
  ON public.traffic_sessions FOR SELECT TO authenticated
  USING (public.can_view_analytics(auth.uid()));

-- Allow agencia to read whatsapp_leads
DROP POLICY IF EXISTS "Admins can read whatsapp leads" ON public.whatsapp_leads;
CREATE POLICY "Analytics users can read whatsapp leads"
  ON public.whatsapp_leads FOR SELECT TO authenticated
  USING (public.can_view_analytics(auth.uid()));

-- Allow agencia to read section_events
DROP POLICY IF EXISTS "Admins can read section events" ON public.section_events;
CREATE POLICY "Analytics users can read section events"
  ON public.section_events FOR SELECT TO authenticated
  USING (public.can_view_analytics(auth.uid()));
