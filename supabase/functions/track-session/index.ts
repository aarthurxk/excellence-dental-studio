import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    if (!body?.session_id) {
      return new Response(
        JSON.stringify({ error: "Missing session_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trunc = (s: string | null | undefined, max = 500) =>
      s ? s.slice(0, max) : null;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabase.from("traffic_sessions").upsert(
      {
        session_id: trunc(body.session_id, 100)!,
        referrer: trunc(body.referrer),
        utm_source: trunc(body.utm_source, 200),
        utm_medium: trunc(body.utm_medium, 200),
        utm_campaign: trunc(body.utm_campaign, 500),
        utm_content: trunc(body.utm_content, 500),
        utm_term: trunc(body.utm_term, 500),
        gclid: trunc(body.gclid, 200),
        fbclid: trunc(body.fbclid, 200),
        ttclid: trunc(body.ttclid, 200),
        device_os: trunc(body.device_os, 50),
        browser: trunc(body.browser, 100),
        browser_in_app: body.browser_in_app ?? false,
        screen_resolution: trunc(body.screen_resolution, 20),
        network_type: trunc(body.network_type, 20),
        user_timezone: trunc(body.user_timezone, 50),
        user_language: trunc(body.user_language, 20),
      },
      { onConflict: "session_id", ignoreDuplicates: true }
    );

    if (error) console.error("Session upsert error:", error.message);

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("track-session error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
