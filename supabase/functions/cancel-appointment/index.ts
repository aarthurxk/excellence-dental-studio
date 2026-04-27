import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GCAL_BASE = "https://connector-gateway.lovable.dev/google_calendar/calendar/v3";

interface Body {
  appointment_id: string;
  reason?: string;
  notify_calendar?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GCAL_API_KEY = Deno.env.get("GOOGLE_CALENDAR_API_KEY");

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authErr } = await userClient.auth.getClaims(token);
    if (authErr || !claims?.claims) return json({ error: "Unauthorized" }, 401);

    const userId = claims.claims.sub;

    // Verificar se é staff
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: isStaff } = await admin.rpc("is_staff", { _uid: userId });
    if (!isStaff) return json({ error: "Forbidden" }, 403);

    const body = (await req.json()) as Body;
    if (!body?.appointment_id) return json({ error: "appointment_id required" }, 400);

    // Buscar appointment
    const { data: appt, error: apptErr } = await admin
      .from("appointments")
      .select("*")
      .eq("id", body.appointment_id)
      .single();

    if (apptErr || !appt) return json({ error: "Appointment not found" }, 404);
    if (appt.status === "cancelled") return json({ error: "Already cancelled" }, 400);

    // Cancelar no Google Calendar (se houver event_id)
    let gcalResult: { ok: boolean; status?: number; error?: string } = { ok: true };
    if (appt.google_event_id && body.notify_calendar !== false) {
      if (!LOVABLE_API_KEY || !GCAL_API_KEY) {
        gcalResult = { ok: false, error: "Calendar credentials missing" };
      } else {
        const resp = await fetch(
          `${GCAL_BASE}/calendars/primary/events/${appt.google_event_id}?sendUpdates=all`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "X-Connection-Api-Key": GCAL_API_KEY,
            },
          },
        );
        if (!resp.ok && resp.status !== 410 && resp.status !== 404) {
          const txt = await resp.text();
          gcalResult = { ok: false, status: resp.status, error: txt };
        } else {
          gcalResult = { ok: true, status: resp.status };
        }
      }
    }

    // Atualizar appointment
    const newNotes = [appt.notes, body.reason ? `[CANCELADO] ${body.reason}` : "[CANCELADO]"]
      .filter(Boolean)
      .join("\n");

    const { error: updErr } = await admin
      .from("appointments")
      .update({
        status: "cancelled",
        notes: newNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", appt.id);

    if (updErr) return json({ error: updErr.message }, 500);

    // Audit log
    await admin.from("vera_audit_log").insert({
      user_id: userId,
      acao: "cancel_appointment",
      tabela: "appointments",
      registro_id: appt.id,
      dados_antes: appt,
      dados_depois: { status: "cancelled", reason: body.reason ?? null },
    });

    return json({ success: true, gcal: gcalResult });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("cancel-appointment error:", msg);
    return json({ error: msg }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
