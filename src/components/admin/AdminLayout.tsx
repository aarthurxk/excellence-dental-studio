import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, Stethoscope, Users, Star, Video, CalendarDays,
  Sparkles, Info, MessageSquare, Settings, LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Tratamentos", url: "/admin/tratamentos", icon: Stethoscope },
  { title: "Dentistas", url: "/admin/dentistas", icon: Users },
  { title: "Depoimentos", url: "/admin/depoimentos", icon: Star },
  { title: "Vídeos", url: "/admin/videos", icon: Video },
  { title: "Eventos", url: "/admin/eventos", icon: CalendarDays },
  { title: "Diferenciais", url: "/admin/diferenciais", icon: Sparkles },
  { title: "Sobre", url: "/admin/sobre", icon: Info },
  { title: "Mensagens", url: "/admin/mensagens", icon: MessageSquare },
  { title: "Configurações", url: "/admin/configuracoes", icon: Settings },
];

function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut } = useAuth();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="hover:bg-muted/50" activeClassName="bg-muted text-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
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
          </header>
          <main className="flex-1 p-6 overflow-auto bg-muted/20">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
