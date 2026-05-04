// Proxy seguro de leitura para o painel admin consultar histórico de conversas da Vera no n8n.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const N8N_LOGS_URL =
  "https://bot.odontoexcellencerecife.com.br/webhook/vera-logs";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const N8N_TOKEN = Deno.env.get("N8N_LEAD_ACTIONS_TOKEN");

    if (!N8N_TOKEN) {
      console.error("[vera-conversation-logs] N8N_LEAD_ACTIONS_TOKEN not configured");
      return json({ error: "Server misconfigured" }, 500);
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: authErr } = await userClient.auth.getUser();
    if (authErr || !userData?.user) return json({ error: "Unauthorized" }, 401);

    const userId = userData.user.id;

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const { data: isStaff, error: staffErr } = await admin.rpc("is_staff", {
      _uid: userId,
    });
    if (staffErr) {
      console.error("[vera-conversation-logs] is_staff error:", staffErr);
      return json({ error: "Authorization check failed" }, 500);
    }
    if (!isStaff) return json({ error: "Forbidden" }, 403);

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const upstream = await fetch(N8N_LOGS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Vera-Actions-Token": N8N_TOKEN,
      },
      body: JSON.stringify(body ?? {}),
    });

    const text = await upstream.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    if (!upstream.ok) {
      console.error("[vera-conversation-logs] upstream error", upstream.status, text);
      return json({ error: "Upstream error", status: upstream.status, data }, 502);
    }

    return json(data, 200);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[vera-conversation-logs] error:", msg);
    return json({ error: msg }, 500);
  }
});
