import { describe, it, expect } from "vitest";

/**
 * Testes unitários puros (sem DOM) para lógica de grupos e filtragem
 * do AdminLayout. Isolados de providers React.
 */

// ── fixtures replicando a estrutura do AdminLayout ─────────────────
const RESTRICTED_URLS = new Set([
  "/admin/whatsapp", "/admin/conversas", "/admin/leads", "/admin/relatorios",
  "/admin/resumos", "/admin/handoff", "/admin/vera-actions", "/admin/vera-health",
  "/admin/vera-prompts", "/admin/audit", "/admin/ao-vivo", "/admin/pendentes",
]);

const NAV_GROUPS = [
  {
    label: "Operação",
    items: [
      { url: "/admin", module: null },
      { url: "/admin/ao-vivo", module: null },
      { url: "/admin/pendentes", module: null },
      { url: "/admin/conversas", module: null },
      { url: "/admin/leads", module: null },
      { url: "/admin/handoff", module: null },
    ],
  },
  {
    label: "Vera IA",
    items: [
      { url: "/admin/resumos", module: null },
      { url: "/admin/vera-actions", module: null },
      { url: "/admin/vera-health", module: null },
      { url: "/admin/vera-prompts", module: null },
    ],
  },
  {
    label: "Conteúdo",
    items: [
      { url: "/admin/tratamentos", module: "services" },
      { url: "/admin/dentistas", module: "dentists" },
      { url: "/admin/depoimentos", module: "testimonials" },
      { url: "/admin/videos", module: "videos" },
      { url: "/admin/eventos", module: "events" },
      { url: "/admin/diferenciais", module: "features" },
      { url: "/admin/antes-depois", module: "before_after" },
      { url: "/admin/sobre", module: "about" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { url: "/admin/analytics", module: null },
      { url: "/admin/relatorios", module: null },
      { url: "/admin/roadmap", module: null },
    ],
  },
  {
    label: "Sistema",
    items: [
      { url: "/admin/mensagens", module: "messages" },
      { url: "/admin/whatsapp", module: null },
      { url: "/admin/usuarios", module: "users" },
      { url: "/admin/configuracoes", module: "settings" },
      { url: "/admin/audit", module: null },
    ],
  },
];

function buildVisibleUrls(role: string, perms: Record<string, { can_view: boolean }>) {
  const set = new Set<string>();
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (role === "agencia") {
        if (item.url === "/admin/analytics" || item.url === "/admin") set.add(item.url);
        continue;
      }
      if (RESTRICTED_URLS.has(item.url)) {
        if (role === "admin" || role === "socio" || role === "gerente") set.add(item.url);
        continue;
      }
      if (!item.module || perms[item.module]?.can_view !== false) set.add(item.url);
    }
  }
  return set;
}

const ALL_PERMS = Object.fromEntries(
  ["services","dentists","testimonials","videos","events","features","before_after","about","messages","users","settings"].map((m) => [m, { can_view: true }])
);

describe("AdminLayout — filtragem de rotas por role", () => {
  it("admin vê todas as rotas", () => {
    const urls = buildVisibleUrls("admin", ALL_PERMS);
    expect(urls.has("/admin/ao-vivo")).toBe(true);
    expect(urls.has("/admin/audit")).toBe(true);
    expect(urls.has("/admin/vera-actions")).toBe(true);
    expect(urls.has("/admin/analytics")).toBe(true);
    expect(urls.size).toBeGreaterThanOrEqual(26);
  });

  it("agencia vê apenas dashboard e analytics", () => {
    const urls = buildVisibleUrls("agencia", {});
    expect(urls.has("/admin")).toBe(true);
    expect(urls.has("/admin/analytics")).toBe(true);
    expect(urls.size).toBe(2);
  });

  it("recepcionista não vê rotas restritas", () => {
    const urls = buildVisibleUrls("recepcionista", ALL_PERMS);
    expect(urls.has("/admin/ao-vivo")).toBe(false);
    expect(urls.has("/admin/conversas")).toBe(false);
    expect(urls.has("/admin/leads")).toBe(false);
    expect(urls.has("/admin/audit")).toBe(false);
  });

  it("recepcionista vê conteúdo com can_view=true", () => {
    const urls = buildVisibleUrls("recepcionista", ALL_PERMS);
    expect(urls.has("/admin/tratamentos")).toBe(true);
    expect(urls.has("/admin/dentistas")).toBe(true);
  });

  it("recepcionista não vê módulo com can_view=false", () => {
    const perms = { ...ALL_PERMS, users: { can_view: false } };
    const urls = buildVisibleUrls("recepcionista", perms);
    expect(urls.has("/admin/usuarios")).toBe(false);
  });

  it("gerente vê rotas restritas", () => {
    const urls = buildVisibleUrls("gerente", ALL_PERMS);
    expect(urls.has("/admin/conversas")).toBe(true);
    expect(urls.has("/admin/ao-vivo")).toBe(true);
  });

  it("socio vê rotas restritas", () => {
    const urls = buildVisibleUrls("socio", ALL_PERMS);
    expect(urls.has("/admin/audit")).toBe(true);
    expect(urls.has("/admin/vera-prompts")).toBe(true);
  });

  it("NAV_GROUPS tem exatamente 5 grupos", () => {
    expect(NAV_GROUPS.length).toBe(5);
  });

  it("total de itens no nav é 26", () => {
    const total = NAV_GROUPS.reduce((acc, g) => acc + g.items.length, 0);
    expect(total).toBe(26);
  });
});
