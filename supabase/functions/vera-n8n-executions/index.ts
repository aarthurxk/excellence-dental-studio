// Proxy seguro para o painel consultar execucoes recentes da Vera no n8n.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const N8N_API_BASE = "https://bot.odontoexcellencerecife.com.br/api/v1";
const WORKFLOWS = [
  { id: "5kC7iiMPbFl4WzS9", name: "VERA CORE" },
  { id: "WVhStfi8UNgC4B9R", name: "Vera - Conversation Logs API" },
  { id: "rgVenDAtfYCXoUZE", name: "Vera - Lead Actions Admin API" },
  { id: "WeDhsD6j40Ns7h9T", name: "Vera - Lead Actions Executor" },
];

type N8nExecution = {
  id?: string | number;
  workflowId?: string;
  mode?: string;
  status?: string;
  finished?: boolean;
  startedAt?: string;
  stoppedAt?: string;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function assertStaff(authHeader: string) {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: authErr } = await userClient.auth.getUser();
  if (authErr || !userData?.user) return false;

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  const { data: isStaff, error: staffErr } = await admin.rpc("is_staff", {
    _uid: userData.user.id,
  });
  if (staffErr) throw staffErr;
  return !!isStaff;
}

async function fetchWorkflowExecutions(apiKey: string, workflowId: string, limit: number) {
  const url = new URL(`${N8N_API_BASE}/executions`);
  url.searchParams.set("workflowId", workflowId);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("includeData", "false");

  const response = await fetch(url, {
    headers: {
      "X-N8N-API-KEY": apiKey,
      "User-Agent": "codex-vera-health/1.0",
    },
  });

  const text = await response.text();
  let payload: any;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { raw: text };
  }

  if (!response.ok) {
    throw new Error(`n8n executions ${workflowId} failed: ${response.status}`);
  }

  return (payload?.data ?? []) as N8nExecution[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const isStaff = await assertStaff(authHeader);
    if (!isStaff) return json({ error: "Forbidden" }, 403);

    const apiKey = Deno.env.get("N8N_API_KEY");
    if (!apiKey) {
      console.error("[vera-n8n-executions] N8N_API_KEY not configured");
      return json({ error: "Server misconfigured" }, 500);
    }

    let limit = 10;
    try {
      const body = await req.json();
      if (Number.isFinite(body?.limit)) limit = Math.min(Math.max(Number(body.limit), 1), 25);
    } catch {
      // Body is optional.
    }

    const settled = await Promise.allSettled(
      WORKFLOWS.map(async (workflow) => {
        const rows = await fetchWorkflowExecutions(apiKey, workflow.id, limit);
        return rows.map((execution) => ({
          id: execution.id,
          workflowId: workflow.id,
          workflowName: workflow.name,
          mode: execution.mode ?? null,
          status: execution.status ?? (execution.finished ? "success" : "running"),
          finished: execution.finished ?? null,
          startedAt: execution.startedAt ?? null,
          stoppedAt: execution.stoppedAt ?? null,
        }));
      }),
    );

    const errors: string[] = [];
    const executions = settled.flatMap((result, index) => {
      if (result.status === "fulfilled") return result.value;
      errors.push(`${WORKFLOWS[index].name}: ${result.reason?.message ?? String(result.reason)}`);
      return [];
    });

    executions.sort((a, b) => {
      const right = b.startedAt ? new Date(b.startedAt).getTime() : 0;
      const left = a.startedAt ? new Date(a.startedAt).getTime() : 0;
      return right - left;
    });

    return json({
      workflows: WORKFLOWS,
      executions: executions.slice(0, limit * WORKFLOWS.length),
      errors,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[vera-n8n-executions] error:", message);
    return json({ error: message }, 500);
  }
});
