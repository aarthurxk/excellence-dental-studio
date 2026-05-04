import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Users, Star, Video, CalendarDays, MessageSquare, Mail, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { SectionEquipe } from "@/components/admin/dashboard/SectionEquipe";

class EquipeErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

const stats = [
  { key: "services", label: "Tratamentos", icon: Stethoscope, table: "services" as const, url: "/admin/tratamentos", filterActive: true },
  { key: "dentists", label: "Dentistas", icon: Users, table: "dentists" as const, url: "/admin/dentistas", filterActive: true },
  { key: "testimonials", label: "Depoimentos", icon: Star, table: "testimonials" as const, url: "/admin/depoimentos", filterActive: true },
  { key: "videos", label: "Vídeos", icon: Video, table: "videos" as const, url: "/admin/videos", filterActive: true },
  { key: "events", label: "Eventos", icon: CalendarDays, table: "events" as const, url: "/admin/eventos", filterActive: true },
  { key: "features", label: "Diferenciais", icon: Sparkles, table: "features" as const, url: "/admin/diferenciais", filterActive: false },
  { key: "contact_messages", label: "Mensagens", icon: MessageSquare, table: "contact_messages" as const, url: "/admin/mensagens", filterActive: false },
];

export default function AdminDashboard() {
  const counts = stats.map((s) => {
    const { data } = useQuery({
      queryKey: ["admin_count", s.table],
      queryFn: async () => {
        const { count } = await supabase.from(s.table).select("*", { count: "exact", head: true });
        return count ?? 0;
      },
    });
    return { ...s, count: data ?? 0 };
  });

  const { data: unread = 0 } = useQuery({
    queryKey: ["unread_messages_count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("contact_messages")
        .select("*", { count: "exact", head: true })
        .eq("read", false);
      return count ?? 0;
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {counts.map((s) => (
          <Link key={s.key} to={s.url}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
                <s.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{s.count}</p>
                {s.key === "contact_messages" && unread > 0 && (
                  <p className="text-xs text-primary font-medium mt-1 flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {unread} não lida{unread > 1 ? "s" : ""}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <EquipeErrorBoundary><SectionEquipe /></EquipeErrorBoundary>
    </div>
  );
}
