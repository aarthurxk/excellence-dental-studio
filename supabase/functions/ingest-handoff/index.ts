// Receives human handoff requests from n8n.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { corsHeaders, jsonResponse, validateIngestToken } from "../_shared/ingest.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const tokenError = validateIngestToken(req);
  if (tokenError) return tokenError;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const chat_id = String(body?.chat_id ?? "").trim();
  const channel = String(body?.channel ?? "").trim();
  const motivo = String(body?.motivo ?? "").trim();
  if (!chat_id || !channel || !motivo) {
    return jsonResponse({ error: "chat_id, channel, motivo required" }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const { data, error } = await supabase
    .from("vera_handoff_queue")
    .insert({
      chat_id,
      channel,
      motivo,
      payload: body?.payload ?? null,
      status: "pendente",
    })
    .select("id")
    .single();

  if (error) {
    console.error("[ingest-handoff] error:", error);
    return jsonResponse({ error: error.message }, 500);
  }
  return jsonResponse({ ok: true, id: data.id });
});
