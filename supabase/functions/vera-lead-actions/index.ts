// Proxy seguro entre o painel admin e os webhooks n8n para ações de leads da Vera.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const N8N_ADMIN_URL =
  "https://bot.odontoexcellencerecife.com.br/webhook/vera-lead-actions-admin";
const N8N_EXECUTOR_URL =
  "https://bot.odontoexcellencerecife.com.br/webhook/vera-lead-actions-executor";

type Action = "list" | "mark" | "simulate";

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
      console.error("[vera-lead-actions] N8N_LEAD_ACTIONS_TOKEN not configured");
      return json({ error: "Server misconfigured" }, 500);
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authErr } = await userClient.auth.getClaims(token);
    if (authErr || !claims?.claims?.sub) return json({ error: "Unauthorized" }, 401);

    const userId = claims.claims.sub as string;
    const userEmail = (claims.claims.email as string | undefined) ?? null;

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const { data: isStaff, error: staffErr } = await admin.rpc("is_staff", {
      _uid: userId,
    });
    if (staffErr) {
      console.error("[vera-lead-actions] is_staff error:", staffErr);
      return json({ error: "Authorization check failed" }, 500);
    }
    if (!isStaff) return json({ error: "Forbidden" }, 403);

    let body: any;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    const action = body?.action as Action | undefined;
    if (!action || !["list", "mark", "simulate"].includes(action)) {
      return json({ error: "Invalid action. Use 'list', 'mark' or 'simulate'." }, 400);
    }

    const targetUrl = action === "simulate" ? N8N_EXECUTOR_URL : N8N_ADMIN_URL;

    const upstream = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Vera-Actions-Token": N8N_TOKEN,
      },
      body: JSON.stringify(body),
    });

    const text = await upstream.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    // Auditoria (best-effort)
    try {
      await admin.from("vera_audit_log").insert({
        user_id: userId,
        user_email: userEmail,
        acao: `vera_lead_actions:${action}`,
        tabela: "leads",
        registro_id: body?.lead_id ?? body?.phone ?? null,
        dados_antes: null,
        dados_depois: { request: body, upstream_status: upstream.status },
      });
    } catch (e) {
      console.error("[vera-lead-actions] audit insert failed:", e);
    }

    if (!upstream.ok) {
      console.error("[vera-lead-actions] upstream error", upstream.status, text);
      return json({ error: "Upstream error", status: upstream.status, data }, 502);
    }

    return json(data, 200);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[vera-lead-actions] error:", msg);
    return json({ error: msg }, 500);
  }
});
