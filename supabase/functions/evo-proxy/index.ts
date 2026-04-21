import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EVO_BASE = "https://evo.odontoexcellencerecife.com.br";
const INSTANCE = "vera-whatsapp";
const WA_WEBHOOK = "https://bot.odontoexcellencerecife.com.br/webhook/vera-whatsapp";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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
};

async function evoFetch(path: string, method: string, apiKey: string, body?: unknown) {
  const opts: RequestInit = {
    method,
    headers: { apikey: apiKey, "Content-Type": "application/json" },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${EVO_BASE}${path}`, opts);
  const data = await res.json();
  return { status: res.status, data };
}

async function ensureInstanceExists(apiKey: string): Promise<void> {
  // Criar instância
  await evoFetch("/instance/create", "POST", apiKey, {
    instanceName: INSTANCE,
    integration: "WHATSAPP-BAILEYS",
    token: apiKey,
    qrcode: true,
  });

  // Aguardar instância inicializar
  await new Promise((r) => setTimeout(r, 2000));

  // Configurar webhook
  await evoFetch(`/webhook/set/${INSTANCE}`, "POST", apiKey, {
    webhook: {
      enabled: true,
      url: WA_WEBHOOK,
      webhookByEvents: false,
      webhookBase64: false,
      events: ["MESSAGES_UPSERT"],
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "Missing authorization header" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: user.id });
  if (!isAdmin) {
    return new Response(
      JSON.stringify({ error: "Forbidden" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  let action: string;
  let body: unknown;
  try {
    const json = await req.json();
    action = json.action;
    body = json.body;
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const endpoint = ALLOWED_ACTIONS[action];
  if (!endpoint) {
    return new Response(
      JSON.stringify({ error: `Unknown action: ${action}` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const evoApiKey = Deno.env.get("EVO_API_KEY");
  if (!evoApiKey) {
    return new Response(
      JSON.stringify({ error: "EVO_API_KEY not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const fetchOptions: RequestInit = {
      method: endpoint.method,
      headers: { apikey: evoApiKey, "Content-Type": "application/json" },
    };
    if (endpoint.method === "POST" && body) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(`${EVO_BASE}${endpoint.path}`, fetchOptions);
    let data = await response.json();

    // Se connect retornar 404, cria a instância automaticamente e tenta de novo
    if (action === "connect" && (response.status === 404 || data?.error || data?.message?.includes?.("not found"))) {
      await ensureInstanceExists(evoApiKey);
      const retry = await fetch(`${EVO_BASE}${endpoint.path}`, fetchOptions);
      data = await retry.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: retry.status,
      });
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: response.status,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to reach Evolution API", details: String(err) }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
