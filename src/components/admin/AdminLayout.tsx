import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, Stethoscope, Users, Star, Video, CalendarDays,
  Sparkles, Info, MessageSquare, Settings, LogOut, Map, UserCog, ExternalLink, SlidersHorizontal, BarChart3, MessageCircle,
  Smartphone, MessagesSquare, Contact, FileBarChart,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  socio: "Sócio",
  gerente: "Gerente",
  dentista: "Dentista",
  recepcionista: "Recepcionista",
  agencia: "Agência",
  user: "Usuário",
};

const navItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, module: null },
  { title: "Tratamentos", url: "/admin/tratamentos", icon: Stethoscope, module: "services" },
  { title: "Dentistas", url: "/admin/dentistas", icon: Users, module: "dentists" },
  { title: "Depoimentos", url: "/admin/depoimentos", icon: Star, module: "testimonials" },
  { title: "Vídeos", url: "/admin/videos", icon: Video, module: "videos" },
  { title: "Eventos", url: "/admin/eventos", icon: CalendarDays, module: "events" },
  { title: "Diferenciais", url: "/admin/diferenciais", icon: Sparkles, module: "features" },
  { title: "Antes e Depois", url: "/admin/antes-depois", icon: SlidersHorizontal, module: "before_after" },
  { title: "Sobre", url: "/admin/sobre", icon: Info, module: "about" },
  { title: "Mensagens", url: "/admin/mensagens", icon: MessageSquare, module: "messages" },
  { title: "Roadmap", url: "/admin/roadmap", icon: Map, module: "roadmap" },
  { title: "Usuários", url: "/admin/usuarios", icon: UserCog, module: "users" },
  { title: "Configurações", url: "/admin/configuracoes", icon: Settings, module: "settings" },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3, module: null },
  { title: "Conversas Vera", url: "/admin/conversas-vera", icon: MessageCircle, module: null },
  { title: "WhatsApp", url: "/admin/whatsapp", icon: Smartphone, module: null },
  { title: "Conversas WA", url: "/admin/conversas", icon: MessagesSquare, module: null },
  { title: "Leads CRM", url: "/admin/leads", icon: Contact, module: null },
  { title: "Relatórios WA", url: "/admin/relatorios", icon: FileBarChart, module: null },
];

function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut, role } = useAuth();
  const allPerms = usePermissions() as Record<string, { can_view: boolean }>;
  const { data: unreadCount = 0 } = useUnreadMessages();

  const visibleItems = navItems.filter((item) => {
    // Agencia can only see Analytics
    if (role === "agencia") {
      return item.url === "/admin/analytics" || item.url === "/admin";
    }
    // WhatsApp pages only for admin/socio
    if (["/admin/conversas-vera", "/admin/whatsapp", "/admin/conversas"].includes(item.url)) {
      return role === "admin" || role === "socio";
    }
    if (!item.module) return true;
    const perm = allPerms[item.module];
    return perm?.can_view !== false;
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            Menu
            {!collapsed && role && (
              <Badge variant="secondary" className="text-[10px] ml-auto">
                {ROLE_LABELS[role] ?? role}
              </Badge>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="hover:bg-muted/50" activeClassName="bg-muted text-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                      {item.module === "messages" && unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-auto text-[10px] h-5 min-w-5 px-1 flex items-center justify-center">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="mt-auto p-4">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> {!collapsed && "Sair"}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b px-4 bg-background">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-lg font-semibold font-display">Painel Administrativo</h1>
            <Link to="/" className="ml-auto text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
              <ExternalLink className="h-3.5 w-3.5" />
              Voltar ao site
            </Link>
          </header>
          <main className="flex-1 p-6 overflow-auto bg-muted/20">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
