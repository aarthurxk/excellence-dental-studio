/**
 * Testes Etapa 1 — soft delete e auditoria de mensagens.
 * Lógica pura: sem DOM, sem Supabase real.
 */
import { describe, it, expect } from "vitest";

// ── Regras de negócio replicadas ─────────────────────────────────

const AUDIT_ROLES = new Set(["admin", "socio", "gerente"]);

function canViewDeletedMessages(role: string | null | undefined): boolean {
  return !!role && AUDIT_ROLES.has(role);
}

function canSoftDelete(role: string | null | undefined): boolean {
  return !!role && AUDIT_ROLES.has(role);
}

/** Simula a query que AdminMessages faz: se canViewAudit=false, filtra deleted_at IS NULL */
function filterMessages(
  msgs: { id: string; deleted_at: string | null }[],
  canViewAudit: boolean,
) {
  if (canViewAudit) return msgs;
  return msgs.filter((m) => m.deleted_at === null);
}

/** Simula o trigger: ao soft-delete, grava no audit */
function buildAuditEntry(params: {
  sourceTable: string;
  sourceId: string;
  content: string;
  sentAt: string;
  deletedAt: string;
  deletedBy?: string;
  reason?: string;
}) {
  if (!params.content) throw new Error("content obrigatório");
  if (!params.sentAt) throw new Error("sent_at obrigatório");
  return {
    source_table: params.sourceTable,
    source_id: params.sourceId,
    content: params.content,
    sent_at: params.sentAt,
    deleted_at: params.deletedAt,
    deleted_by: params.deletedBy ?? null,
    deletion_reason: params.reason ?? null,
  };
}

// ── Permissões ────────────────────────────────────────────────────

describe("Permissões soft delete", () => {
  it("admin pode ver msgs apagadas", () => expect(canViewDeletedMessages("admin")).toBe(true));
  it("socio pode ver msgs apagadas", () => expect(canViewDeletedMessages("socio")).toBe(true));
  it("gerente pode ver msgs apagadas", () => expect(canViewDeletedMessages("gerente")).toBe(true));
  it("recepcionista NÃO pode ver", () => expect(canViewDeletedMessages("recepcionista")).toBe(false));
  it("dentista NÃO pode ver", () => expect(canViewDeletedMessages("dentista")).toBe(false));
  it("null NÃO pode ver", () => expect(canViewDeletedMessages(null)).toBe(false));
  it("admin pode soft-delete", () => expect(canSoftDelete("admin")).toBe(true));
  it("recepcionista NÃO pode soft-delete", () => expect(canSoftDelete("recepcionista")).toBe(false));
});

// ── Filtragem de mensagens ────────────────────────────────────────

describe("filterMessages — visibilidade por role", () => {
  const msgs = [
    { id: "1", deleted_at: null },
    { id: "2", deleted_at: "2026-05-04T10:00:00Z" },
    { id: "3", deleted_at: null },
  ];

  it("usuário comum vê apenas não-deletadas", () => {
    const result = filterMessages(msgs, false);
    expect(result).toHaveLength(2);
    expect(result.map((m) => m.id)).toEqual(["1", "3"]);
  });

  it("admin vê todas (incluindo deletadas)", () => {
    const result = filterMessages(msgs, true);
    expect(result).toHaveLength(3);
  });

  it("lista vazia retorna vazia", () => {
    expect(filterMessages([], false)).toHaveLength(0);
    expect(filterMessages([], true)).toHaveLength(0);
  });
});

// ── Audit entry ───────────────────────────────────────────────────

describe("buildAuditEntry — geração de registro de auditoria", () => {
  const base = {
    sourceTable: "contact_messages",
    sourceId: "uuid-1",
    content: "Olá, gostaria de agendar",
    sentAt: "2026-05-01T09:00:00Z",
    deletedAt: "2026-05-04T12:00:00Z",
  };

  it("gera entry com campos obrigatórios", () => {
    const entry = buildAuditEntry(base);
    expect(entry.source_table).toBe("contact_messages");
    expect(entry.source_id).toBe("uuid-1");
    expect(entry.content).toBe("Olá, gostaria de agendar");
    expect(entry.deleted_at).toBe("2026-05-04T12:00:00Z");
  });

  it("deleted_by e reason são null quando não informados", () => {
    const entry = buildAuditEntry(base);
    expect(entry.deleted_by).toBeNull();
    expect(entry.deletion_reason).toBeNull();
  });

  it("inclui deleted_by e reason quando informados", () => {
    const entry = buildAuditEntry({ ...base, deletedBy: "user-abc", reason: "Spam" });
    expect(entry.deleted_by).toBe("user-abc");
    expect(entry.deletion_reason).toBe("Spam");
  });

  it("lança erro se content vazio", () => {
    expect(() => buildAuditEntry({ ...base, content: "" })).toThrow("content obrigatório");
  });

  it("lança erro se sentAt vazio", () => {
    expect(() => buildAuditEntry({ ...base, sentAt: "" })).toThrow("sent_at obrigatório");
  });

  it("funciona com source_table conversations_log", () => {
    const entry = buildAuditEntry({ ...base, sourceTable: "conversations_log" });
    expect(entry.source_table).toBe("conversations_log");
  });
});

// ── ConvLogMeta com deleted_at ────────────────────────────────────

describe("ConvLogMeta — campos de soft delete", () => {
  interface ConvLogMeta {
    id: string;
    deleted_at: string | null;
    deleted_by: string | null;
    deletion_reason: string | null;
  }

  const metaDeleted: ConvLogMeta = {
    id: "log-1",
    deleted_at: "2026-05-04T10:00:00Z",
    deleted_by: "user-admin",
    deletion_reason: null,
  };

  const metaActive: ConvLogMeta = {
    id: "log-2",
    deleted_at: null,
    deleted_by: null,
    deletion_reason: null,
  };

  it("detecta mensagem apagada via deleted_at", () => {
    expect(!!metaDeleted.deleted_at).toBe(true);
  });

  it("mensagem ativa não está apagada", () => {
    expect(!!metaActive.deleted_at).toBe(false);
  });

  it("mensagem apagada tem deleted_by registrado", () => {
    expect(metaDeleted.deleted_by).toBe("user-admin");
  });
});
