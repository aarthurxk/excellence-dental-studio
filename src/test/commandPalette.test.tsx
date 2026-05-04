/**
 * Testes da CommandPalette — lógica pura (sem DOM/portal).
 * Testes de interação com cmdk requerem browser real (scrollIntoView,
 * portais Radix) — cobertura via e2e / Playwright quando implementado.
 */
import { describe, it, expect } from "vitest";
import { ALL_NAV_ENTRIES } from "@/components/admin/CommandPalette";

describe("CommandPalette — ALL_NAV_ENTRIES", () => {
  it("cobre os 5 grupos esperados", () => {
    const groups = new Set(ALL_NAV_ENTRIES.map((e) => e.group));
    expect(groups).toContain("Operação");
    expect(groups).toContain("Vera IA");
    expect(groups).toContain("Conteúdo");
    expect(groups).toContain("Analytics");
    expect(groups).toContain("Sistema");
  });

  it("tem ao menos 26 entradas", () => {
    expect(ALL_NAV_ENTRIES.length).toBeGreaterThanOrEqual(26);
  });

  it("cada entrada tem url iniciando com /admin", () => {
    for (const entry of ALL_NAV_ENTRIES) {
      expect(entry.url).toMatch(/^\/admin/);
    }
  });

  it("cada entrada tem title não-vazio", () => {
    for (const entry of ALL_NAV_ENTRIES) {
      expect(entry.title.length).toBeGreaterThan(0);
    }
  });

  it("cada entrada tem icon definido (Lucide forwardRef)", () => {
    for (const entry of ALL_NAV_ENTRIES) {
      expect(entry.icon).toBeTruthy();
    }
  });

  it("não há URLs duplicadas", () => {
    const urls = ALL_NAV_ENTRIES.map((e) => e.url);
    const unique = new Set(urls);
    expect(unique.size).toBe(urls.length);
  });

  it("grupo Operação inclui ao-vivo e pendentes (novas rotas)", () => {
    const op = ALL_NAV_ENTRIES.filter((e) => e.group === "Operação");
    const urls = op.map((e) => e.url);
    expect(urls).toContain("/admin/ao-vivo");
    expect(urls).toContain("/admin/pendentes");
  });

  it("grupo Vera IA tem exatamente 4 entradas", () => {
    const vera = ALL_NAV_ENTRIES.filter((e) => e.group === "Vera IA");
    expect(vera.length).toBe(4);
  });
});
