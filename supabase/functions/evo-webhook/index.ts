// Receives Evolution API messages.upsert webhook and persists to leads + conversations_log.
// Auth: X-Ingest-Token header (no JWT — public webhook).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import {
  corsHeaders,
  jsonResponse,
  phoneFromJid,
  validateIngestToken,
} from "../_shared/ingest.ts";

declare const EdgeRuntime: { waitUntil: (p: Promise<unknown>) => void };

function fanOutToN8n(body: unknown) {
  const url = Deno.env.get("N8N_VERA_WA_ADAPTER_URL");
  if (!url) return;
  const task = (async () => {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) {
        console.error("[evo-webhook] n8n fan-out failed:", res.status, await res.text());
      }
    } catch (e) {
      console.error("[evo-webhook] n8n fan-out error:", e);
    }
  })();
  try {
    EdgeRuntime.waitUntil(task);
  } catch {
    // EdgeRuntime not available — fire and forget
    task.catch(() => {});
  }
}

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

  // Always 200 for non-target events to avoid Evolution retries
  if (body?.event && body.event !== "messages.upsert") {
    return jsonResponse({ ok: true, ignored: body.event });
  }

  const data = body?.data;
  if (!data?.key?.remoteJid) {
    return jsonResponse({ ok: true, ignored: "no remoteJid" });
  }

  const remoteJid: string = data.key.remoteJid;
  const fromMe: boolean = !!data.key.fromMe;
  const messageId: string | null = data.key.id ?? null;
  const phone = phoneFromJid(remoteJid);
  if (!phone) return jsonResponse({ ok: true, ignored: "invalid phone" });

  // Skip group chats
  if (remoteJid.endsWith("@g.us")) return jsonResponse({ ok: true, ignored: "group" });

  const pushName: string | null = data.pushName ?? null;
  const ts: number | null = data.messageTimestamp ?? null;
  const m = data.message ?? {};
  const isAudio = !!m.audioMessage;
  const messageText: string =
    m.conversation ??
    m.extendedTextMessage?.text ??
    (isAudio ? "[ÁUDIO — aguardando transcrição]" : "[mensagem não suportada]");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  try {
    // 1) UPSERT lead by phone
    const { data: existing } = await supabase
      .from("leads")
      .select("id, total_messages_in, total_messages_out, name, push_name")
      .eq("phone", phone)
      .maybeSingle();

    const nowIso = new Date().toISOString();
    if (!existing) {
      await supabase.from("leads").insert({
        phone,
        push_name: pushName,
        name: pushName,
        first_contact_at: nowIso,
        last_contact_at: nowIso,
        last_message_preview: messageText.slice(0, 200),
        total_messages_in: fromMe ? 0 : 1,
        total_messages_out: fromMe ? 1 : 0,
        ai_enabled: true,
      });
    } else {
      await supabase
        .from("leads")
        .update({
          push_name: pushName ?? existing.push_name,
          name: existing.name ?? pushName,
          last_contact_at: nowIso,
          last_message_preview: messageText.slice(0, 200),
          total_messages_in: (existing.total_messages_in ?? 0) + (fromMe ? 0 : 1),
          total_messages_out: (existing.total_messages_out ?? 0) + (fromMe ? 1 : 0),
        })
        .eq("id", existing.id);
    }

    // 2) INSERT conversation log (idempotent on whatsapp_message_id when present)
    if (messageId) {
      const { data: dup } = await supabase
        .from("conversations_log")
        .select("id")
        .eq("whatsapp_message_id", messageId)
        .maybeSingle();
      if (dup) return jsonResponse({ ok: true, duplicate: true });
    }

    await supabase.from("conversations_log").insert({
      lead_phone: phone,
      remote_jid: remoteJid,
      direction: fromMe ? "outgoing" : "incoming",
      message_text: messageText,
      message_type: isAudio ? "audio" : "text",
      sent_by: fromMe ? "ai" : "lead",
      whatsapp_message_id: messageId,
      whatsapp_timestamp: ts,
      is_audio: isAudio,
      audio_pending: isAudio,
    });

    return jsonResponse({ ok: true });
  } catch (e) {
    console.error("[evo-webhook] error:", e);
    // Still 200 to avoid Evolution retries — log it
    return jsonResponse({ ok: false, error: String(e) }, 200);
  }
});
