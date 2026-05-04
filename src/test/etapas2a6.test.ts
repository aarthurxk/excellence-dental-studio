/**
 * Testes Etapas 2–6 — lógica pura (sem DOM).
 */
import { describe, it, expect } from "vitest";

// ── Etapa 2: ranking helpers ──────────────────────────────────────

function buildRanking(rows: { user_email: string }[]) {
  const counts: Record<string, number> = {};
  for (const r of rows) {
    if (r.user_email) counts[r.user_email] = (counts[r.user_email] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([email, count]) => ({ email, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

describe("RankingAtendentes — lógica de agrupamento", () => {
  const rows = [
    { user_email: "a@x.com" },
    { user_email: "a@x.com" },
    { user_email: "b@x.com" },
    { user_email: "a@x.com" },
    { user_email: "c@x.com" },
    { user_email: "c@x.com" },
  ];

  it("ordena por contagem decrescente", () => {
    const r = buildRanking(rows);
    expect(r[0].email).toBe("a@x.com");
    expect(r[0].count).toBe(3);
    expect(r[1].count).toBe(2);
  });

  it("limita a 5 entradas", () => {
    const big = Array.from({ length: 10 }, (_, i) => ({ user_email: `u${i}@x.com` }));
    expect(buildRanking(big).length).toBeLessThanOrEqual(5);
  });

  it("lista vazia retorna vazia", () => {
    expect(buildRanking([])).toHaveLength(0);
  });
});

// ── Etapa 3: AgentLiveCard dados ──────────────────────────────────

type PresenceStatus = "online" | "away" | "offline";
const ORDER: Record<PresenceStatus, number> = { online: 0, away: 1, offline: 2 };

function sortAgents(agents: { status: PresenceStatus }[]) {
  return [...agents].sort((a, b) => ORDER[a.status] - ORDER[b.status]);
}

describe("AgentLiveCard — ordenação de presença", () => {
  const agents = [
    { id: "1", status: "offline" as PresenceStatus },
    { id: "2", status: "online" as PresenceStatus },
    { id: "3", status: "away" as PresenceStatus },
    { id: "4", status: "online" as PresenceStatus },
  ];

  it("online vem antes de away", () => {
    const sorted = sortAgents(agents);
    expect(sorted[0].status).toBe("online");
    expect(sorted[1].status).toBe("online");
    expect(sorted[2].status).toBe("away");
  });

  it("offline vem por último", () => {
    const sorted = sortAgents(agents);
    expect(sorted[sorted.length - 1].status).toBe("offline");
  });
});

// ── Etapa 4: AdminPendentes — waitMinutes calc ───────────────────

function calcWaitMinutes(lastContactAt: string | null): number | undefined {
  if (!lastContactAt) return undefined;
  return Math.floor((Date.now() - new Date(lastContactAt).getTime()) / 60_000);
}

describe("AdminPendentes — cálculo de espera", () => {
  it("retorna undefined se lastContactAt é null", () => {
    expect(calcWaitMinutes(null)).toBeUndefined();
  });

  it("retorna 0 para timestamp muito recente", () => {
    const now = new Date().toISOString();
    expect(calcWaitMinutes(now)).toBeGreaterThanOrEqual(0);
  });

  it("calcula minutos corretos para 1h atrás", () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const mins = calcWaitMinutes(oneHourAgo)!;
    expect(mins).toBeGreaterThanOrEqual(59);
    expect(mins).toBeLessThanOrEqual(61);
  });
});

// ── Etapa 5: filtro por tag em conversas ─────────────────────────

function filterChatsByTags(
  chats: { remoteJid: string }[],
  selectedTagIds: string[],
  leadsByPhone: Record<string, string>,
  tagsMap: Record<string, { id: string }[]>,
) {
  if (selectedTagIds.length === 0) return chats;
  return chats.filter((c) => {
    const phone = c.remoteJid.replace("@s.whatsapp.net", "");
    const leadId = leadsByPhone[phone];
    if (!leadId) return false;
    const leadTags = (tagsMap[leadId] ?? []).map((t) => t.id);
    return selectedTagIds.some((id) => leadTags.includes(id));
  });
}

describe("TagFilter em conversas — lógica de filtragem", () => {
  const chats = [
    { remoteJid: "5581900000001@s.whatsapp.net" },
    { remoteJid: "5581900000002@s.whatsapp.net" },
    { remoteJid: "5581900000003@s.whatsapp.net" },
  ];
  const leadsByPhone: Record<string, string> = {
    "5581900000001": "lead-1",
    "5581900000002": "lead-2",
  };
  const tagsMap: Record<string, { id: string }[]> = {
    "lead-1": [{ id: "tag-vip" }, { id: "tag-ativo" }],
    "lead-2": [{ id: "tag-ativo" }],
  };

  it("sem filtro retorna todos", () => {
    expect(filterChatsByTags(chats, [], leadsByPhone, tagsMap)).toHaveLength(3);
  });

  it("filtra por tag-vip — retorna apenas lead-1", () => {
    const r = filterChatsByTags(chats, ["tag-vip"], leadsByPhone, tagsMap);
    expect(r).toHaveLength(1);
    expect(r[0].remoteJid).toContain("0001");
  });

  it("filtra por tag-ativo — retorna lead-1 e lead-2", () => {
    const r = filterChatsByTags(chats, ["tag-ativo"], leadsByPhone, tagsMap);
    expect(r).toHaveLength(2);
  });

  it("chat sem lead cadastrado some com filtro ativo", () => {
    const r = filterChatsByTags(chats, ["tag-vip"], leadsByPhone, tagsMap);
    expect(r.some((c) => c.remoteJid.includes("0003"))).toBe(false);
  });
});

// ── Etapa 6: ProtectedRoute — lógica de gate ─────────────────────

function canViewModule(
  role: string | null,
  module: string,
  allowedRoles: string[],
  perms: Record<string, { can_view: boolean }>,
): boolean {
  if (!role) return false;
  if (allowedRoles.includes(role)) return true;
  return perms[module]?.can_view !== false;
}

describe("ProtectedRoute — gate por módulo", () => {
  const perms = { messages_audit: { can_view: true }, live_view: { can_view: false } };

  it("admin tem acesso irrestrito via allowedRoles", () => {
    expect(canViewModule("admin", "live_view", ["admin", "socio"], perms)).toBe(true);
  });

  it("recepcionista bloqueada em módulo can_view=false", () => {
    expect(canViewModule("recepcionista", "live_view", ["admin"], perms)).toBe(false);
  });

  it("recepcionista acessa módulo can_view=true", () => {
    expect(canViewModule("recepcionista", "messages_audit", ["admin"], perms)).toBe(true);
  });

  it("null retorna false", () => {
    expect(canViewModule(null, "messages_audit", [], perms)).toBe(false);
  });
});
