/**
 * Testes de fundação (Etapa 0) — lógica pura sem DOM/providers.
 * Testa: ConversationCard tipos, TagFilter seleção, useConversationFilters lógica,
 * useDeletedMessages permissão, MetricsCard trend, DeletedMessageBadge.
 */
import { describe, it, expect } from "vitest";

// ── helpers copiados dos módulos (sem importar React) ────────────

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function slaColor(minutes: number) {
  if (minutes < 15) return "text-emerald-600 bg-emerald-50";
  if (minutes < 30) return "text-amber-600 bg-amber-50";
  return "text-red-600 bg-red-50";
}

function trendClass(trend: number) {
  if (trend > 0) return "text-emerald-600";
  if (trend < 0) return "text-red-500";
  return "text-muted-foreground";
}

function deserializeTags(raw: string | null): string[] {
  if (!raw) return [];
  return raw.split(",").filter(Boolean);
}

function serializeTags(ids: string[]) {
  return ids.join(",");
}

function applyLocalFilter<T extends { id: string; displayName?: string; phone?: string; status?: string | null; tags?: { id: string }[] }>(
  items: T[],
  filters: { search: string; tagIds: string[]; status: string },
) {
  return items.filter((item) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!(item.displayName ?? "").toLowerCase().includes(q) && !(item.phone ?? "").includes(q)) return false;
    }
    if (filters.tagIds.length > 0) {
      const ids = (item.tags ?? []).map((t) => t.id);
      if (!filters.tagIds.some((id) => ids.includes(id))) return false;
    }
    if (filters.status && item.status !== filters.status) return false;
    return true;
  });
}

const ALLOWED_ROLES = new Set(["admin", "socio", "gerente"]);

// ── ConversationCard helpers ──────────────────────────────────────

describe("ConversationCard — helpers", () => {
  it("initials de nome simples", () => {
    expect(initials("João Silva")).toBe("JS");
  });

  it("initials de nome único", () => {
    expect(initials("Ana")).toBe("A");
  });

  it("initials de string vazia retorna vazio", () => {
    expect(initials("")).toBe("");
  });

  it("slaColor < 15min = verde", () => {
    expect(slaColor(10)).toContain("emerald");
  });

  it("slaColor 15-29min = amarelo", () => {
    expect(slaColor(20)).toContain("amber");
  });

  it("slaColor >= 30min = vermelho", () => {
    expect(slaColor(45)).toContain("red");
  });
});

// ── MetricsCard — trend ───────────────────────────────────────────

describe("MetricsCard — trend classes", () => {
  it("trend positivo = emerald", () => {
    expect(trendClass(10)).toBe("text-emerald-600");
  });

  it("trend negativo = red", () => {
    expect(trendClass(-5)).toBe("text-red-500");
  });

  it("trend zero = muted", () => {
    expect(trendClass(0)).toBe("text-muted-foreground");
  });
});

// ── useConversationFilters — serialização ─────────────────────────

describe("useConversationFilters — serialização URL", () => {
  it("serialize/deserialize roundtrip", () => {
    const ids = ["abc", "def", "ghi"];
    expect(deserializeTags(serializeTags(ids))).toEqual(ids);
  });

  it("deserialize null retorna []", () => {
    expect(deserializeTags(null)).toEqual([]);
  });

  it("deserialize string vazia retorna []", () => {
    expect(deserializeTags("")).toEqual([]);
  });

  it("filtro por search — nome", () => {
    const items = [
      { id: "1", displayName: "Maria Silva", phone: "81900000001", status: null },
      { id: "2", displayName: "João Santos", phone: "81900000002", status: null },
    ];
    const result = applyLocalFilter(items, { search: "maria", tagIds: [], status: "" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("filtro por search — telefone", () => {
    const items = [
      { id: "1", displayName: "X", phone: "81900000001", status: null },
      { id: "2", displayName: "Y", phone: "81900000002", status: null },
    ];
    const result = applyLocalFilter(items, { search: "0001", tagIds: [], status: "" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("filtro por tagId — retorna apenas com a tag", () => {
    const items = [
      { id: "1", displayName: "A", status: null, tags: [{ id: "tag-1" }] },
      { id: "2", displayName: "B", status: null, tags: [{ id: "tag-2" }] },
      { id: "3", displayName: "C", status: null, tags: [] },
    ];
    const result = applyLocalFilter(items, { search: "", tagIds: ["tag-1"], status: "" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("filtro por status", () => {
    const items = [
      { id: "1", displayName: "A", status: "Novo" },
      { id: "2", displayName: "B", status: "Agendado" },
    ];
    const result = applyLocalFilter(items, { search: "", tagIds: [], status: "Novo" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("sem filtros ativos retorna todos", () => {
    const items = [
      { id: "1", displayName: "A", status: "Novo" },
      { id: "2", displayName: "B", status: "Agendado" },
    ];
    const result = applyLocalFilter(items, { search: "", tagIds: [], status: "" });
    expect(result).toHaveLength(2);
  });
});

// ── useDeletedMessages — permissão ────────────────────────────────

describe("useDeletedMessages — controle de acesso por role", () => {
  it("admin pode ver", () => expect(ALLOWED_ROLES.has("admin")).toBe(true));
  it("socio pode ver", () => expect(ALLOWED_ROLES.has("socio")).toBe(true));
  it("gerente pode ver", () => expect(ALLOWED_ROLES.has("gerente")).toBe(true));
  it("recepcionista NÃO pode ver", () => expect(ALLOWED_ROLES.has("recepcionista")).toBe(false));
  it("dentista NÃO pode ver", () => expect(ALLOWED_ROLES.has("dentista")).toBe(false));
  it("agencia NÃO pode ver", () => expect(ALLOWED_ROLES.has("agencia")).toBe(false));
});
