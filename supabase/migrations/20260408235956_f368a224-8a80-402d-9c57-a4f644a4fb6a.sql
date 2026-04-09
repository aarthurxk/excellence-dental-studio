
-- =============================================
-- TABELA: traffic_sessions
-- =============================================
CREATE TABLE public.traffic_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  referrer text DEFAULT '',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  gclid text,
  fbclid text,
  ttclid text,
  device_os text,
  browser text,
  browser_in_app boolean DEFAULT false,
  screen_resolution text,
  network_type text,
  user_timezone text,
  user_language text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_traffic_sessions_session_id ON public.traffic_sessions (session_id);
CREATE INDEX idx_traffic_sessions_created_at ON public.traffic_sessions (created_at);
CREATE INDEX idx_traffic_sessions_utm_source ON public.traffic_sessions (utm_source);

ALTER TABLE public.traffic_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can insert traffic sessions"
  ON public.traffic_sessions FOR INSERT
  TO anon WITH CHECK (true);

CREATE POLICY "Admins can read traffic sessions"
  ON public.traffic_sessions FOR SELECT
  TO authenticated USING (is_admin(auth.uid()));

-- =============================================
-- TABELA: whatsapp_leads
-- =============================================
CREATE TABLE public.whatsapp_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  button_id text NOT NULL,
  time_on_site_seconds integer DEFAULT 0,
  max_scroll_depth integer DEFAULT 0,
  click_timestamp timestamptz NOT NULL DEFAULT now(),
  user_timezone text,
  user_language text,
  ip_address text,
  ip_isp text,
  geo_state text,
  geo_city text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_whatsapp_leads_session_id ON public.whatsapp_leads (session_id);
CREATE INDEX idx_whatsapp_leads_created_at ON public.whatsapp_leads (created_at);
CREATE INDEX idx_whatsapp_leads_button_id ON public.whatsapp_leads (button_id);

ALTER TABLE public.whatsapp_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can insert whatsapp leads"
  ON public.whatsapp_leads FOR INSERT
  TO anon WITH CHECK (true);

CREATE POLICY "Service role can insert whatsapp leads"
  ON public.whatsapp_leads FOR INSERT
  TO service_role WITH CHECK (true);

CREATE POLICY "Admins can read whatsapp leads"
  ON public.whatsapp_leads FOR SELECT
  TO authenticated USING (is_admin(auth.uid()));

-- =============================================
-- RPC: analytics_daily_comparison
-- =============================================
CREATE OR REPLACE FUNCTION public.analytics_daily_comparison(_type text DEFAULT 'leads')
RETURNS TABLE(current_count bigint, previous_count bigint, growth_percentage numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
  WITH hour_cutoff AS (
    SELECT EXTRACT(HOUR FROM now())::int AS h
  ),
  current_period AS (
    SELECT count(*) AS cnt FROM (
      SELECT 1 FROM whatsapp_leads
      WHERE _type = 'leads'
        AND created_at >= date_trunc('day', now())
      UNION ALL
      SELECT 1 FROM traffic_sessions
      WHERE _type = 'sessions'
        AND created_at >= date_trunc('day', now())
    ) sub
  ),
  previous_period AS (
    SELECT count(*) AS cnt FROM (
      SELECT 1 FROM whatsapp_leads
      WHERE _type = 'leads'
        AND created_at >= date_trunc('day', now() - interval '1 day')
        AND created_at < date_trunc('day', now() - interval '1 day') + ((SELECT h FROM hour_cutoff) || ' hours')::interval
      UNION ALL
      SELECT 1 FROM traffic_sessions
      WHERE _type = 'sessions'
        AND created_at >= date_trunc('day', now() - interval '1 day')
        AND created_at < date_trunc('day', now() - interval '1 day') + ((SELECT h FROM hour_cutoff) || ' hours')::interval
    ) sub
  )
  SELECT
    c.cnt AS current_count,
    p.cnt AS previous_count,
    CASE WHEN p.cnt = 0 THEN 0
      ELSE ROUND(((c.cnt - p.cnt)::numeric / p.cnt) * 100, 1)
    END AS growth_percentage
  FROM current_period c, previous_period p;
$$;

-- =============================================
-- RPC: analytics_weekly_comparison
-- =============================================
CREATE OR REPLACE FUNCTION public.analytics_weekly_comparison(_type text DEFAULT 'leads')
RETURNS TABLE(current_count bigint, previous_count bigint, growth_percentage numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
  WITH week_start AS (
    SELECT date_trunc('week', now()) AS ws
  ),
  days_elapsed AS (
    SELECT EXTRACT(EPOCH FROM (now() - (SELECT ws FROM week_start)))::int AS secs
  ),
  current_period AS (
    SELECT count(*) AS cnt FROM (
      SELECT 1 FROM whatsapp_leads
      WHERE _type = 'leads'
        AND created_at >= (SELECT ws FROM week_start)
      UNION ALL
      SELECT 1 FROM traffic_sessions
      WHERE _type = 'sessions'
        AND created_at >= (SELECT ws FROM week_start)
    ) sub
  ),
  previous_period AS (
    SELECT count(*) AS cnt FROM (
      SELECT 1 FROM whatsapp_leads
      WHERE _type = 'leads'
        AND created_at >= (SELECT ws FROM week_start) - interval '7 days'
        AND created_at < (SELECT ws FROM week_start) - interval '7 days' + ((SELECT secs FROM days_elapsed) || ' seconds')::interval
      UNION ALL
      SELECT 1 FROM traffic_sessions
      WHERE _type = 'sessions'
        AND created_at >= (SELECT ws FROM week_start) - interval '7 days'
        AND created_at < (SELECT ws FROM week_start) - interval '7 days' + ((SELECT secs FROM days_elapsed) || ' seconds')::interval
    ) sub
  )
  SELECT
    c.cnt AS current_count,
    p.cnt AS previous_count,
    CASE WHEN p.cnt = 0 THEN 0
      ELSE ROUND(((c.cnt - p.cnt)::numeric / p.cnt) * 100, 1)
    END AS growth_percentage
  FROM current_period c, previous_period p;
$$;

-- =============================================
-- RPC: analytics_monthly_comparison
-- =============================================
CREATE OR REPLACE FUNCTION public.analytics_monthly_comparison(_type text DEFAULT 'leads')
RETURNS TABLE(current_count bigint, previous_count bigint, growth_percentage numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
  WITH month_start AS (
    SELECT date_trunc('month', now()) AS ms
  ),
  days_elapsed AS (
    SELECT EXTRACT(EPOCH FROM (now() - (SELECT ms FROM month_start)))::int AS secs
  ),
  current_period AS (
    SELECT count(*) AS cnt FROM (
      SELECT 1 FROM whatsapp_leads
      WHERE _type = 'leads'
        AND created_at >= (SELECT ms FROM month_start)
      UNION ALL
      SELECT 1 FROM traffic_sessions
      WHERE _type = 'sessions'
        AND created_at >= (SELECT ms FROM month_start)
    ) sub
  ),
  previous_period AS (
    SELECT count(*) AS cnt FROM (
      SELECT 1 FROM whatsapp_leads
      WHERE _type = 'leads'
        AND created_at >= (SELECT ms FROM month_start) - interval '1 month'
        AND created_at < (SELECT ms FROM month_start) - interval '1 month' + ((SELECT secs FROM days_elapsed) || ' seconds')::interval
      UNION ALL
      SELECT 1 FROM traffic_sessions
      WHERE _type = 'sessions'
        AND created_at >= (SELECT ms FROM month_start) - interval '1 month'
        AND created_at < (SELECT ms FROM month_start) - interval '1 month' + ((SELECT secs FROM days_elapsed) || ' seconds')::interval
    ) sub
  )
  SELECT
    c.cnt AS current_count,
    p.cnt AS previous_count,
    CASE WHEN p.cnt = 0 THEN 0
      ELSE ROUND(((c.cnt - p.cnt)::numeric / p.cnt) * 100, 1)
    END AS growth_percentage
  FROM current_period c, previous_period p;
$$;

-- =============================================
-- RPC: analytics_leads_by_source
-- =============================================
CREATE OR REPLACE FUNCTION public.analytics_leads_by_source()
RETURNS TABLE(source text, campaign text, lead_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
  SELECT
    COALESCE(ts.utm_source, 'direto') AS source,
    COALESCE(ts.utm_campaign, '(sem campanha)') AS campaign,
    count(wl.id) AS lead_count
  FROM whatsapp_leads wl
  LEFT JOIN traffic_sessions ts ON ts.session_id = wl.session_id
  WHERE wl.created_at >= now() - interval '30 days'
  GROUP BY ts.utm_source, ts.utm_campaign
  ORDER BY lead_count DESC;
$$;

-- =============================================
-- RPC: analytics_leads_by_button
-- =============================================
CREATE OR REPLACE FUNCTION public.analytics_leads_by_button()
RETURNS TABLE(button_id text, lead_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
  SELECT button_id, count(*) AS lead_count
  FROM whatsapp_leads
  WHERE created_at >= now() - interval '30 days'
  GROUP BY button_id
  ORDER BY lead_count DESC;
$$;

-- =============================================
-- RPC: analytics_device_breakdown
-- =============================================
CREATE OR REPLACE FUNCTION public.analytics_device_breakdown()
RETURNS TABLE(device_os text, network_type text, browser_in_app boolean, session_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
  SELECT
    COALESCE(device_os, 'desconhecido') AS device_os,
    COALESCE(network_type, 'desconhecido') AS network_type,
    COALESCE(browser_in_app, false) AS browser_in_app,
    count(*) AS session_count
  FROM traffic_sessions
  WHERE created_at >= now() - interval '30 days'
  GROUP BY device_os, network_type, browser_in_app
  ORDER BY session_count DESC;
$$;

-- =============================================
-- RPC: analytics_scroll_quality
-- =============================================
CREATE OR REPLACE FUNCTION public.analytics_scroll_quality()
RETURNS TABLE(total_leads bigint, high_scroll_leads bigint, high_scroll_pct numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
  WITH stats AS (
    SELECT
      count(*) AS total,
      count(*) FILTER (WHERE max_scroll_depth >= 75) AS high
    FROM whatsapp_leads
    WHERE created_at >= now() - interval '30 days'
  )
  SELECT
    total AS total_leads,
    high AS high_scroll_leads,
    CASE WHEN total = 0 THEN 0
      ELSE ROUND((high::numeric / total) * 100, 1)
    END AS high_scroll_pct
  FROM stats;
$$;
