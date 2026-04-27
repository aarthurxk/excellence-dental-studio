// Shared helpers for ingest webhooks (n8n / Evolution → Lovable Cloud)

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-ingest-token",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
};

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Validates X-Ingest-Token header against INGEST_TOKEN secret using
 * a constant-time comparison. Returns null if OK, or a Response if rejected.
 */
export function validateIngestToken(req: Request): Response | null {
  const expected = Deno.env.get("INGEST_TOKEN");
  if (!expected) {
    console.error("[ingest] INGEST_TOKEN not configured");
    return jsonResponse({ error: "Server misconfigured" }, 500);
  }
  const provided = req.headers.get("X-Ingest-Token") ?? "";
  if (!constantTimeEqual(provided, expected)) {
    return jsonResponse({ error: "Invalid token" }, 401);
  }
  return null;
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Strips suffix "@s.whatsapp.net" / "@c.us" / "@g.us" and returns digits only.
 */
export function phoneFromJid(jid: string | null | undefined): string {
  if (!jid) return "";
  const at = jid.indexOf("@");
  const local = at === -1 ? jid : jid.slice(0, at);
  return local.replace(/\D/g, "");
}
