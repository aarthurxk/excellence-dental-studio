// Receives audio transcription updates from n8n.
// PUT { whatsapp_message_id, transcription }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { corsHeaders, jsonResponse, validateIngestToken } from "../_shared/ingest.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "PUT" && req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const tokenError = validateIngestToken(req);
  if (tokenError) return tokenError;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const messageId = String(body?.whatsapp_message_id ?? "").trim();
  const transcription = String(body?.transcription ?? "").trim();
  if (!messageId || !transcription) {
    return jsonResponse({ error: "whatsapp_message_id and transcription required" }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const { data, error } = await supabase
    .from("conversations_log")
    .update({
      message_text: transcription,
      audio_pending: false,
    })
    .eq("whatsapp_message_id", messageId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[evo-webhook-update] error:", error);
    return jsonResponse({ error: error.message }, 500);
  }
  if (!data) return jsonResponse({ error: "message not found" }, 404);
  return jsonResponse({ ok: true, id: data.id });
});
