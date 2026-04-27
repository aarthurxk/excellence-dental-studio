// Receives conversation closing summary from n8n workflow "Resumo Encerramento".
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { corsHeaders, jsonResponse, validateIngestToken } from "../_shared/ingest.ts";

const VALID_OUTCOMES = ["agendou", "recusou", "transferido", "abandonado"];

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

  const user_id = String(body?.user_id ?? "").trim();
  const channel = String(body?.channel ?? "").trim();
  const resumo = String(body?.resumo ?? "").trim();
  const outcome = body?.outcome ? String(body.outcome) : null;
  if (!user_id || !channel || !resumo) {
    return jsonResponse({ error: "user_id, channel, resumo required" }, 400);
  }
  if (outcome && !VALID_OUTCOMES.includes(outcome)) {
    return jsonResponse({ error: `outcome must be one of ${VALID_OUTCOMES.join(",")}` }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const { data, error } = await supabase
    .from("vera_resumos")
    .insert({
      user_id,
      channel,
      resumo,
      outcome,
      data_agendamento: body?.data_agendamento ?? null,
      tags: Array.isArray(body?.tags) ? body.tags : null,
      origem: body?.origem ?? "n8n",
    })
    .select("id")
    .single();

  if (error) {
    console.error("[ingest-resumo] error:", error);
    return jsonResponse({ error: error.message }, 500);
  }
  return jsonResponse({ ok: true, id: data.id });
});
