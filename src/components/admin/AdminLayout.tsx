import * as React from "react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  LayoutDashboard, Stethoscope, Users, Star, Video, CalendarDays,
  Sparkles, Info, MessageSquare, Settings, LogOut, Map, UserCog,
  ExternalLink, SlidersHorizontal, BarChart3, Smartphone, MessagesSquare,
  Contact, FileBarChart, FileText, HandHelping, Brain, ShieldCheck,
  ListChecks, Activity, Zap, Clock, Search, ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { CommandPalette, ALL_NAV_ENTRIES } from "@/components/admin/CommandPalette";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  socio: "Sócio",
  gerente: "Gerente",
  dentista: "Dentista",
  recepcionista: "Recepcionista",
  agencia: "Agência",
  user: "Usuário",
};

// ── Grouped nav definition ────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: "Operação",
    items: [
      { title: "Dashboard", url: "/admin", icon: LayoutDashboard, module: null },
      { title: "Ao Vivo", url: "/admin/ao-vivo", icon: Zap, module: null },
      { title: "Pendentes", url: "/admin/pendentes", icon: Clock, module: null },
      { title: "Conversas", url: "/admin/conversas", icon: MessagesSquare, module: null },
      { title: "Leads CRM", url: "/admin/leads", icon: Contact, module: null },
      { title: "Handoff", url: "/admin/handoff", icon: HandHelping, module: null },
    ],
  },
  {
    label: "Vera IA",
    items: [
      { title: "Resumos Vera", url: "/admin/resumos", icon: FileText, module: null },
      { title: "Acoes Vera", url: "/admin/vera-actions", icon: ListChecks, module: null },
      { title: "Saude Vera", url: "/admin/vera-health", icon: Activity, module: null },
      { title: "Prompts Vera", url: "/admin/vera-prompts", icon: Brain, module: null },
    ],
  },
  {
    label: "Conteúdo",
    items: [
      { title: "Tratamentos", url: "/admin/tratamentos", icon: Stethoscope, module: "services" },
      { title: "Dentistas", url: "/admin/dentistas", icon: Users, module: "dentists" },
      { title: "Depoimentos", url: "/admin/depoimentos", icon: Star, module: "testimonials" },
      { title: "Vídeos", url: "/admin/videos", icon: Video, module: "videos" },
      { title: "Eventos", url: "/admin/eventos", icon: CalendarDays, module: "events" },
      { title: "Diferenciais", url: "/admin/diferenciais", icon: Sparkles, module: "features" },
      { title: "Antes e Depois", url: "/admin/antes-depois", icon: SlidersHorizontal, module: "before_after" },
      { title: "Sobre", url: "/admin/sobre", icon: Info, module: "about" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { title: "Analytics Site", url: "/admin/analytics", icon: BarChart3, module: null },
      { title: "Relatórios WA", url: "/admin/relatorios", icon: FileBarChart, module: null },
      { title: "Roadmap", url: "/admin/roadmap", icon: Map, module: null },
    ],
  },
  {
    label: "Sistema",
    items: [
      { title: "Mensagens", url: "/admin/mensagens", icon: MessageSquare, module: "messages" },
      { title: "WhatsApp", url: "/admin/whatsapp", icon: Smartphone, module: null },
      { title: "Usuários", url: "/admin/usuarios", icon: UserCog, module: "users" },
      { title: "Configurações", url: "/admin/configuracoes", icon: Settings, module: "settings" },
      { title: "Auditoria", url: "/admin/audit", icon: ShieldCheck, module: null },
    ],
  },
] as const;

// URLs exclusivas p/ admin/sócio
const RESTRICTED_URLS = new Set([
  "/admin/whatsapp", "/admin/conversas", "/admin/leads", "/admin/relatorios",
  "/admin/resumos", "/admin/handoff", "/admin/vera-actions", "/admin/vera-health",
  "/admin/vera-prompts", "/admin/audit", "/admin/ao-vivo", "/admin/pendentes",
]);

// ── Sidebar interno ───────────────────────────────────────────────
function AdminSidebar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut, role } = useAuth();
  const allPerms = usePermissions() as Record<string, { can_view: boolean }>;
  const { data: unreadCount = 0 } = useUnreadMessages();

  function isVisible(item: { url: string; module: string | null }) {
    if (role === "agencia") return item.url === "/admin/analytics" || item.url === "/admin";
    if (RESTRICTED_URLS.has(item.url)) return role === "admin" || role === "socio" || role === "gerente";
    if (!item.module) return true;
    return allPerms[item.module]?.can_view !== false;
  }

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="gap-0">
        {/* Logo / brand strip */}
        <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4 shrink-0">
          {!collapsed && (
            <span className="text-sm font-semibold text-sidebar-foreground tracking-tight truncate">
              Odonto Excellence
            </span>
          )}
          {collapsed && (
            <span className="text-xs font-bold text-sidebar-primary mx-auto">OE</span>
          )}
        </div>

        {/* Cmd+K search trigger */}
        <div className="px-2 py-2 border-b border-sidebar-border">
          <button
            onClick={onOpenPalette}
            className={
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs " +
              "text-sidebar-foreground/60 hover:text-sidebar-foreground " +
              "hover:bg-sidebar-accent transition-colors"
            }
            aria-label="Abrir paleta de comandos (Ctrl+K)"
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">Buscar...</span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-sidebar-border bg-sidebar-accent px-1 font-mono text-[10px] text-sidebar-foreground/40">
                  ⌃K
                </kbd>
              </>
            )}
          </button>
        </div>

        {/* Nav groups */}
        <div className="flex-1 overflow-y-auto py-2">
          {NAV_GROUPS.map((group) => {
            const visible = group.items.filter(isVisible);
            if (!visible.length) return null;
            if (collapsed) {
              return (
                <SidebarGroup key={group.label} className="py-1">
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {visible.map((item) => (
                        <SidebarMenuItem key={item.url}>
                          <SidebarMenuButton asChild>
                            <NavLink
                              to={item.url}
                              end={item.url === "/admin"}
                              className="group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                              activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
                            >
                              <item.icon className="h-4 w-4 shrink-0" />
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              );
            }
            return (
              <Collapsible key={group.label} defaultOpen className="group/collapsible py-1">
                <SidebarGroup className="py-0">
                  <CollapsibleTrigger asChild>
                    <SidebarGroupLabel
                      asChild
                      className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 px-3 py-1 hover:text-sidebar-foreground/70 cursor-pointer"
                    >
                      <button type="button" className="flex w-full items-center justify-between">
                        <span>{group.label}</span>
                        <ChevronDown className="h-3 w-3 transition-transform group-data-[state=closed]/collapsible:-rotate-90" />
                      </button>
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {visible.map((item) => (
                          <SidebarMenuItem key={item.url}>
                            <SidebarMenuButton asChild>
                              <NavLink
                                to={item.url}
                                end={item.url === "/admin"}
                                className="group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                                activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
                              >
                                <item.icon className="h-4 w-4 shrink-0" />
                                <span className="truncate">{item.title}</span>
                                {"module" in item && item.module === "messages" && unreadCount > 0 && (
                                  <Badge
                                    variant="destructive"
                                    className="ml-auto text-[10px] h-4 min-w-4 px-1 flex items-center justify-center"
                                  >
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                  </Badge>
                                )}
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            );
          })}
        </div>

        {/* Footer: role badge + logout */}
        <div className="border-t border-sidebar-border px-3 py-3 space-y-1 shrink-0">
          {!collapsed && role && (
            <div className="px-1 pb-1">
              <Badge
                variant="secondary"
                className="text-[10px] bg-sidebar-accent text-sidebar-foreground/60 border-0"
              >
                {ROLE_LABELS[role] ?? role}
              </Badge>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent h-8 px-2"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="ml-2">Sair</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

// ── Layout root ───────────────────────────────────────────────────
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const { role } = useAuth();
  const allPerms = usePermissions() as Record<string, { can_view: boolean }>;

  // Build the set of visible URLs for the palette
  const visibleUrls = React.useMemo(() => {
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
        if (!item.module || allPerms[item.module]?.can_view !== false) set.add(item.url);
      }
    }
    return set;
  }, [role, allPerms]);

  // Global Ctrl+K / Cmd+K shortcut
  React.useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <SidebarProvider>
      <div className="admin-layout min-h-screen flex w-full bg-background">
        <AdminSidebar onOpenPalette={() => setPaletteOpen(true)} />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border px-4 bg-background shrink-0 gap-3">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <span className="text-sm font-semibold tracking-tight">Painel Administrativo</span>
            <Link
              to="/"
              className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Voltar ao site
            </Link>
          </header>

          <main className="flex-1 overflow-auto bg-muted/30 p-6">
            {children}
          </main>
        </div>

        <CommandPalette
          open={paletteOpen}
          onOpenChange={setPaletteOpen}
          visibleUrls={visibleUrls}
        />
      </div>
    </SidebarProvider>
  );
}
