import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EVO_BASE = "https://evo.odontoexcellencerecife.com.br";
const INSTANCE = "vera-whatsapp";
const WA_WEBHOOK = "http://10.0.2.4:5678/webhook/vera-wa-adapter";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_ACTIONS: Record<string, { method: string; path: string }> = {
  connectionState: { method: "GET", path: `/instance/connectionState/${INSTANCE}` },
  findChats: { method: "POST", path: `/chat/findChats/${INSTANCE}` },
  findMessages: { method: "POST", path: `/chat/findMessages/${INSTANCE}` },
  findContacts: { method: "POST", path: `/chat/findContacts/${INSTANCE}` },
  sendText: { method: "POST", path: `/message/sendText/${INSTANCE}` },
  connect: { method: "GET", path: `/instance/connect/${INSTANCE}` },
  fetchInstances: { method: "GET", path: `/instance/fetchInstances` },
  logout: { method: "DELETE", path: `/instance/logout/${INSTANCE}` },
  restart: { method: "PUT", path: `/instance/restart/${INSTANCE}` },
  pairingCode: { method: "POST", path: `/instance/pairingCode/${INSTANCE}` },
};

async function evoFetch(path: string, method: string, apiKey: string, body?: unknown) {
  const opts: RequestInit = { method, headers: { apikey: apiKey, "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${EVO_BASE}${path}`, opts);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function ensureInstanceExists(apiKey: string): Promise<void> {
  console.log("[evo-proxy] Creating instance...");
  await evoFetch("/instance/create", "POST", apiKey, {
    instanceName: INSTANCE,
    integration: "WHATSAPP-BAILEYS",
    token: "548C7E69-C5EA-49FE-9FD4-FCCD9797F52D",
    qrcode: true,
    webhook: {
      enabled: true,
      url: WA_WEBHOOK,
      webhookByEvents: false,
      webhookBase64: false,
      events: ["MESSAGES_UPSERT"],
    },
  });
  await new Promise((r) => setTimeout(r, 2000));
  console.log("[evo-proxy] Webhook already set via create.");
}

function ok(data: unknown) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function err(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return err("Missing authorization header", 401);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return err("Unauthorized", 401);

  const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: user.id });
  if (!isAdmin) return err("Forbidden", 403);

  let action: string, body: unknown;
  try { const json = await req.json(); action = json.action; body = json.body; }
  catch { return err("Invalid JSON body"); }

  const endpoint = ALLOWED_ACTIONS[action];
  if (!endpoint) return err(`Unknown action: ${action}`);

  const evoApiKey = Deno.env.get("EVO_API_KEY");
  if (!evoApiKey) return err("EVO_API_KEY not configured", 500);

  try {
    console.log(`[evo-proxy] action=${action} → ${endpoint.method} ${endpoint.path}`);
    const response = await evoFetch(endpoint.path, endpoint.method, evoApiKey, endpoint.method === "POST" ? body : undefined);
    console.log(`[evo-proxy] evo status=${response.status} data=${JSON.stringify(response.data).slice(0, 200)}`);

    if (
      action === "connect" &&
      (response.status === 404 ||
        response.data?.error ||
        (typeof response.data?.message === "string" && response.data.message.toLowerCase().includes("not found")))
    ) {
      console.log("[evo-proxy] Instance not found, auto-creating...");
      await ensureInstanceExists(evoApiKey);
      const retry = await evoFetch(endpoint.path, endpoint.method, evoApiKey);
      console.log(`[evo-proxy] retry status=${retry.status} data=${JSON.stringify(retry.data).slice(0, 200)}`);
      return ok(retry.data);
    }

    return ok(response.data);
  } catch (e) {
    console.error("[evo-proxy] error:", e);
    return err(`Failed to reach Evolution API: ${String(e)}`, 502);
  }
});
