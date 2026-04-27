// Receives SPIN stage updates from n8n VERA CORE node "Salvar Estagio SPIN".
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { corsHeaders, jsonResponse, validateIngestToken } from "../_shared/ingest.ts";

const VALID_STAGES = [
  "triagem",
  "situacao",
  "problema",
  "implicacao",
  "necessidade",
  "proposta",
  "encerramento",
];

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
  const spin_stage = String(body?.spin_stage ?? "").trim();
  if (!chat_id || !channel || !spin_stage) {
    return jsonResponse({ error: "chat_id, channel, spin_stage required" }, 400);
  }
  if (!VALID_STAGES.includes(spin_stage)) {
    return jsonResponse({ error: `spin_stage must be one of ${VALID_STAGES.join(",")}` }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  // Check if existing row to detect stage transition
  const { data: existing } = await supabase
    .from("vera_conversation_state")
    .select("id, spin_stage")
    .eq("chat_id", chat_id)
    .eq("channel", channel)
    .maybeSingle();

  const nowIso = new Date().toISOString();
  const stageChanged = !existing || existing.spin_stage !== spin_stage;

  const { error } = await supabase.from("vera_conversation_state").upsert(
    {
      chat_id,
      channel,
      spin_stage,
      stage_entered_at: stageChanged ? nowIso : undefined,
      updated_at: nowIso,
    },
    { onConflict: "chat_id,channel" },
  );

  if (error) {
    console.error("[ingest-conversation-state] error:", error);
    return jsonResponse({ error: error.message }, 500);
  }
  return jsonResponse({ ok: true, stage_changed: stageChanged });
});
