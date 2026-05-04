import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard, Stethoscope, Users, Star, Video, CalendarDays,
  Sparkles, Info, MessageSquare, Settings, Map, UserCog,
  SlidersHorizontal, BarChart3, Smartphone, MessagesSquare, Contact,
  FileBarChart, FileText, HandHelping, Brain, ShieldCheck, ListChecks,
  Activity, Zap, Clock,
} from "lucide-react";

export interface NavEntry {
  title: string;
  url: string;
  icon: React.ElementType;
  group: string;
}

export const ALL_NAV_ENTRIES: NavEntry[] = [
  // Operação
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, group: "Operação" },
  { title: "Ao Vivo", url: "/admin/ao-vivo", icon: Zap, group: "Operação" },
  { title: "Pendentes", url: "/admin/pendentes", icon: Clock, group: "Operação" },
  { title: "Conversas", url: "/admin/conversas", icon: MessagesSquare, group: "Operação" },
  { title: "Leads CRM", url: "/admin/leads", icon: Contact, group: "Operação" },
  { title: "Handoff", url: "/admin/handoff", icon: HandHelping, group: "Operação" },
  // Vera IA
  { title: "Resumos Vera", url: "/admin/resumos", icon: FileText, group: "Vera IA" },
  { title: "Acoes Vera", url: "/admin/vera-actions", icon: ListChecks, group: "Vera IA" },
  { title: "Saude Vera", url: "/admin/vera-health", icon: Activity, group: "Vera IA" },
  { title: "Prompts Vera", url: "/admin/vera-prompts", icon: Brain, group: "Vera IA" },
  // Conteúdo
  { title: "Tratamentos", url: "/admin/tratamentos", icon: Stethoscope, group: "Conteúdo" },
  { title: "Dentistas", url: "/admin/dentistas", icon: Users, group: "Conteúdo" },
  { title: "Depoimentos", url: "/admin/depoimentos", icon: Star, group: "Conteúdo" },
  { title: "Vídeos", url: "/admin/videos", icon: Video, group: "Conteúdo" },
  { title: "Eventos", url: "/admin/eventos", icon: CalendarDays, group: "Conteúdo" },
  { title: "Diferenciais", url: "/admin/diferenciais", icon: Sparkles, group: "Conteúdo" },
  { title: "Antes e Depois", url: "/admin/antes-depois", icon: SlidersHorizontal, group: "Conteúdo" },
  { title: "Sobre", url: "/admin/sobre", icon: Info, group: "Conteúdo" },
  // Analytics
  { title: "Analytics Site", url: "/admin/analytics", icon: BarChart3, group: "Analytics" },
  { title: "Relatórios WA", url: "/admin/relatorios", icon: FileBarChart, group: "Analytics" },
  { title: "Roadmap", url: "/admin/roadmap", icon: Map, group: "Analytics" },
  // Sistema
  { title: "Mensagens", url: "/admin/mensagens", icon: MessageSquare, group: "Sistema" },
  { title: "WhatsApp", url: "/admin/whatsapp", icon: Smartphone, group: "Sistema" },
  { title: "Usuários", url: "/admin/usuarios", icon: UserCog, group: "Sistema" },
  { title: "Configurações", url: "/admin/configuracoes", icon: Settings, group: "Sistema" },
  { title: "Auditoria", url: "/admin/audit", icon: ShieldCheck, group: "Sistema" },
];

const GROUPS = ["Operação", "Vera IA", "Conteúdo", "Analytics", "Sistema"] as const;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Subset of entries visible to the current user's role */
  visibleUrls: Set<string>;
}

export function CommandPalette({ open, onOpenChange, visibleUrls }: Props) {
  const navigate = useNavigate();

  function handleSelect(url: string) {
    onOpenChange(false);
    navigate(url);
  }

  const visible = ALL_NAV_ENTRIES.filter((e) => visibleUrls.has(e.url));

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Buscar página..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado.</CommandEmpty>
        {GROUPS.map((group, i) => {
          const entries = visible.filter((e) => e.group === group);
          if (!entries.length) return null;
          return (
            <React.Fragment key={group}>
              {i > 0 && <CommandSeparator />}
              <CommandGroup heading={group}>
                {entries.map((entry) => (
                  <CommandItem
                    key={entry.url}
                    value={entry.title}
                    onSelect={() => handleSelect(entry.url)}
                    className="gap-2"
                  >
                    <entry.icon className="h-4 w-4 text-muted-foreground" />
                    {entry.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            </React.Fragment>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
