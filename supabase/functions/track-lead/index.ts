import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Known datacenter / hosting ISPs — bots come from these
const DATACENTER_ISP_PATTERNS = [
  "heficed", "colocrossing", "ovh", "hetzner", "digitalocean",
  "amazon", "google cloud", "microsoft azure", "linode", "vultr",
  "scaleway", "contabo", "choopa", "serverius", "m247",
  "datacamp", "hostwinds", "leaseweb", "cloudflare", "oracle cloud",
  "alibaba", "tencent", "kamatera", "upcloud", "cherry servers",
];

function isDatacenterISP(isp: string | null): boolean {
  if (!isp) return false;
  const lower = isp.toLowerCase();
  return DATACENTER_ISP_PATTERNS.some((p) => lower.includes(p));
}

interface SessionPayload {
  session_id: string;
  referrer?: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  gclid?: string | null;
  fbclid?: string | null;
  ttclid?: string | null;
  device_os?: string;
  browser?: string;
  browser_in_app?: boolean;
  screen_resolution?: string;
  network_type?: string;
  user_timezone?: string;
  user_language?: string;
}

interface LeadPayload {
  session_id: string;
  button_id: string;
  time_on_site_seconds?: number;
  max_scroll_depth?: number;
  user_timezone?: string;
  user_language?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const session: SessionPayload = body.session;
    const lead: LeadPayload = body.lead;

    if (!session?.session_id || !lead?.button_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trunc = (s: string | null | undefined, max = 500) =>
      s ? s.slice(0, max) : null;

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // GeoIP lookup
    let geo = { city: null as string | null, state: null as string | null, isp: null as string | null };
    try {
      const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=city,regionName,isp&lang=pt-BR`, {
        signal: AbortSignal.timeout(2000),
      });
      if (geoRes.ok) {
        const g = await geoRes.json();
        geo = { city: g.city || null, state: g.regionName || null, isp: g.isp || null };
      }
    } catch { /* GeoIP failed, continue */ }

    const isBot = isDatacenterISP(geo.isp);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Rate-limit: max 1 lead per session_id + button_id per 30s
    if (!isBot) {
      const { data: recent } = await supabase
        .from("whatsapp_leads")
        .select("id")
        .eq("session_id", trunc(session.session_id, 100)!)
        .eq("button_id", trunc(lead.button_id, 50)!)
        .gte("created_at", new Date(Date.now() - 30_000).toISOString())
        .limit(1);

      if (recent && recent.length > 0) {
        return new Response(
          JSON.stringify({ ok: true, debounced: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Upsert session
    const { error: sessErr } = await supabase.from("traffic_sessions").upsert(
      {
        session_id: trunc(session.session_id, 100)!,
        referrer: trunc(session.referrer),
        utm_source: trunc(session.utm_source, 200),
        utm_medium: trunc(session.utm_medium, 200),
        utm_campaign: trunc(session.utm_campaign, 500),
        utm_content: trunc(session.utm_content, 500),
        utm_term: trunc(session.utm_term, 500),
        gclid: trunc(session.gclid, 200),
        fbclid: trunc(session.fbclid, 200),
        ttclid: trunc(session.ttclid, 200),
        device_os: trunc(session.device_os, 50),
        browser: trunc(session.browser, 100),
        browser_in_app: session.browser_in_app ?? false,
        screen_resolution: trunc(session.screen_resolution, 20),
        network_type: trunc(session.network_type, 20),
        user_timezone: trunc(session.user_timezone, 50),
        user_language: trunc(session.user_language, 20),
      },
      { onConflict: "session_id", ignoreDuplicates: true }
    );

    if (sessErr) console.error("Session insert error:", sessErr.message);

    // Insert lead (with is_bot flag)
    const { error: leadErr } = await supabase.from("whatsapp_leads").insert({
      session_id: trunc(lead.session_id, 100)!,
      button_id: trunc(lead.button_id, 50)!,
      time_on_site_seconds: Math.min(Math.max(lead.time_on_site_seconds || 0, 0), 86400),
      max_scroll_depth: Math.min(Math.max(lead.max_scroll_depth || 0, 0), 100),
      user_timezone: trunc(lead.user_timezone, 50),
      user_language: trunc(lead.user_language, 20),
      ip_address: ip,
      ip_isp: geo.isp,
      geo_state: geo.state,
      geo_city: geo.city,
      is_bot: isBot,
    });

    if (leadErr) console.error("Lead insert error:", leadErr.message);

    return new Response(
      JSON.stringify({ ok: true, is_bot: isBot }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("track-lead error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
