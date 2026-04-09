
CREATE OR REPLACE FUNCTION public.analytics_leads_by_geo(_group_by text DEFAULT 'city')
RETURNS TABLE(location_name text, lead_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    CASE
      WHEN _group_by = 'state' THEN COALESCE(geo_state, 'Desconhecido')
      ELSE COALESCE(geo_city, 'Desconhecido')
    END AS location_name,
    count(*) AS lead_count
  FROM whatsapp_leads
  WHERE created_at >= now() - interval '30 days'
  GROUP BY location_name
  ORDER BY lead_count DESC
  LIMIT 10;
$$;
