
-- 1. Add is_bot column
ALTER TABLE public.whatsapp_leads ADD COLUMN is_bot boolean NOT NULL DEFAULT false;

-- 2. Mark existing datacenter ISP records as bots
UPDATE public.whatsapp_leads
SET is_bot = true
WHERE ip_isp IS NOT NULL AND (
  ip_isp ILIKE '%heficed%'
  OR ip_isp ILIKE '%colocrossing%'
  OR ip_isp ILIKE '%ovh%'
  OR ip_isp ILIKE '%hetzner%'
  OR ip_isp ILIKE '%digitalocean%'
  OR ip_isp ILIKE '%amazon%'
  OR ip_isp ILIKE '%google cloud%'
  OR ip_isp ILIKE '%microsoft azure%'
  OR ip_isp ILIKE '%linode%'
  OR ip_isp ILIKE '%vultr%'
  OR ip_isp ILIKE '%scaleway%'
  OR ip_isp ILIKE '%contabo%'
  OR ip_isp ILIKE '%choopa%'
  OR ip_isp ILIKE '%serverius%'
  OR ip_isp ILIKE '%m247%'
  OR ip_isp ILIKE '%datacamp%'
  OR ip_isp ILIKE '%hostwinds%'
  OR ip_isp ILIKE '%leaseweb%'
);

-- 3. Add index for filtering
CREATE INDEX idx_whatsapp_leads_is_bot ON public.whatsapp_leads (is_bot) WHERE is_bot = false;

-- 4. Update analytics functions to exclude bots

CREATE OR REPLACE FUNCTION public.analytics_daily_comparison(_type text DEFAULT 'leads')
RETURNS TABLE(current_count bigint, previous_count bigint, growth_percentage numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  WITH hour_cutoff AS (
    SELECT EXTRACT(HOUR FROM now())::int AS h
  ),
  current_period AS (
    SELECT count(*) AS cnt FROM (
      SELECT 1 FROM whatsapp_leads
      WHERE _type = 'leads' AND is_bot = false
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
      WHERE _type = 'leads' AND is_bot = false
        AND created_at >= date_trunc('day', now() - interval '1 day')
        AND created_at < date_trunc('day', now() - interval '1 day') + ((SELECT h FROM hour_cutoff) || ' hours')::interval
      UNION ALL
      SELECT 1 FROM traffic_sessions
      WHERE _type = 'sessions'
        AND created_at >= date_trunc('day', now() - interval '1 day')
        AND created_at < date_trunc('day', now() - interval '1 day') + ((SELECT h FROM hour_cutoff) || ' hours')::interval
    ) sub
  )
  SELECT c.cnt, p.cnt,
    CASE WHEN p.cnt = 0 THEN 0 ELSE ROUND(((c.cnt - p.cnt)::numeric / p.cnt) * 100, 1) END
  FROM current_period c, previous_period p;
$$;

CREATE OR REPLACE FUNCTION public.analytics_weekly_comparison(_type text DEFAULT 'leads')
RETURNS TABLE(current_count bigint, previous_count bigint, growth_percentage numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  WITH week_start AS (SELECT date_trunc('week', now()) AS ws),
  days_elapsed AS (SELECT EXTRACT(EPOCH FROM (now() - (SELECT ws FROM week_start)))::int AS secs),
  current_period AS (
    SELECT count(*) AS cnt FROM (
      SELECT 1 FROM whatsapp_leads WHERE _type = 'leads' AND is_bot = false AND created_at >= (SELECT ws FROM week_start)
      UNION ALL
      SELECT 1 FROM traffic_sessions WHERE _type = 'sessions' AND created_at >= (SELECT ws FROM week_start)
    ) sub
  ),
  previous_period AS (
    SELECT count(*) AS cnt FROM (
      SELECT 1 FROM whatsapp_leads WHERE _type = 'leads' AND is_bot = false
        AND created_at >= (SELECT ws FROM week_start) - interval '7 days'
        AND created_at < (SELECT ws FROM week_start) - interval '7 days' + ((SELECT secs FROM days_elapsed) || ' seconds')::interval
      UNION ALL
      SELECT 1 FROM traffic_sessions WHERE _type = 'sessions'
        AND created_at >= (SELECT ws FROM week_start) - interval '7 days'
        AND created_at < (SELECT ws FROM week_start) - interval '7 days' + ((SELECT secs FROM days_elapsed) || ' seconds')::interval
    ) sub
  )
  SELECT c.cnt, p.cnt,
    CASE WHEN p.cnt = 0 THEN 0 ELSE ROUND(((c.cnt - p.cnt)::numeric / p.cnt) * 100, 1) END
  FROM current_period c, previous_period p;
$$;

CREATE OR REPLACE FUNCTION public.analytics_monthly_comparison(_type text DEFAULT 'leads')
RETURNS TABLE(current_count bigint, previous_count bigint, growth_percentage numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  WITH month_start AS (SELECT date_trunc('month', now()) AS ms),
  days_elapsed AS (SELECT EXTRACT(EPOCH FROM (now() - (SELECT ms FROM month_start)))::int AS secs),
  current_period AS (
    SELECT count(*) AS cnt FROM (
      SELECT 1 FROM whatsapp_leads WHERE _type = 'leads' AND is_bot = false AND created_at >= (SELECT ms FROM month_start)
      UNION ALL
      SELECT 1 FROM traffic_sessions WHERE _type = 'sessions' AND created_at >= (SELECT ms FROM month_start)
    ) sub
  ),
  previous_period AS (
    SELECT count(*) AS cnt FROM (
      SELECT 1 FROM whatsapp_leads WHERE _type = 'leads' AND is_bot = false
        AND created_at >= (SELECT ms FROM month_start) - interval '1 month'
        AND created_at < (SELECT ms FROM month_start) - interval '1 month' + ((SELECT secs FROM days_elapsed) || ' seconds')::interval
      UNION ALL
      SELECT 1 FROM traffic_sessions WHERE _type = 'sessions'
        AND created_at >= (SELECT ms FROM month_start) - interval '1 month'
        AND created_at < (SELECT ms FROM month_start) - interval '1 month' + ((SELECT secs FROM days_elapsed) || ' seconds')::interval
    ) sub
  )
  SELECT c.cnt, p.cnt,
    CASE WHEN p.cnt = 0 THEN 0 ELSE ROUND(((c.cnt - p.cnt)::numeric / p.cnt) * 100, 1) END
  FROM current_period c, previous_period p;
$$;

CREATE OR REPLACE FUNCTION public.analytics_leads_by_button()
RETURNS TABLE(button_id text, lead_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT button_id, count(*) AS lead_count
  FROM whatsapp_leads
  WHERE created_at >= now() - interval '30 days' AND is_bot = false
  GROUP BY button_id
  ORDER BY lead_count DESC;
$$;

CREATE OR REPLACE FUNCTION public.analytics_leads_by_source()
RETURNS TABLE(source text, campaign text, lead_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT
    COALESCE(ts.utm_source, 'direto') AS source,
    COALESCE(ts.utm_campaign, '(sem campanha)') AS campaign,
    count(wl.id) AS lead_count
  FROM whatsapp_leads wl
  LEFT JOIN traffic_sessions ts ON ts.session_id = wl.session_id
  WHERE wl.created_at >= now() - interval '30 days' AND wl.is_bot = false
  GROUP BY ts.utm_source, ts.utm_campaign
  ORDER BY lead_count DESC;
$$;

CREATE OR REPLACE FUNCTION public.analytics_scroll_quality()
RETURNS TABLE(total_leads bigint, high_scroll_leads bigint, high_scroll_pct numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  WITH stats AS (
    SELECT
      count(*) AS total,
      count(*) FILTER (WHERE max_scroll_depth >= 75) AS high
    FROM whatsapp_leads
    WHERE created_at >= now() - interval '30 days' AND is_bot = false
  )
  SELECT total, high,
    CASE WHEN total = 0 THEN 0 ELSE ROUND((high::numeric / total) * 100, 1) END
  FROM stats;
$$;

CREATE OR REPLACE FUNCTION public.analytics_leads_by_geo(_group_by text DEFAULT 'city')
RETURNS TABLE(location_name text, lead_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT
    CASE WHEN _group_by = 'state' THEN COALESCE(geo_state, 'Desconhecido') ELSE COALESCE(geo_city, 'Desconhecido') END AS location_name,
    count(*) AS lead_count
  FROM whatsapp_leads
  WHERE created_at >= now() - interval '30 days' AND is_bot = false
  GROUP BY location_name
  ORDER BY lead_count DESC
  LIMIT 10;
$$;
