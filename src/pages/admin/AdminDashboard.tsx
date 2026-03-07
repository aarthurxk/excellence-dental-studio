import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Users, Star, Video, CalendarDays, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { key: "services", label: "Tratamentos", icon: Stethoscope, table: "services" as const, url: "/admin/tratamentos" },
  { key: "dentists", label: "Dentistas", icon: Users, table: "dentists" as const, url: "/admin/dentistas" },
  { key: "testimonials", label: "Depoimentos", icon: Star, table: "testimonials" as const, url: "/admin/depoimentos" },
  { key: "videos", label: "Vídeos", icon: Video, table: "videos" as const, url: "/admin/videos" },
  { key: "events", label: "Eventos", icon: CalendarDays, table: "events" as const, url: "/admin/eventos" },
  { key: "contact_messages", label: "Mensagens", icon: MessageSquare, table: "contact_messages" as const, url: "/admin/mensagens" },
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {counts.map((s) => (
          <Link key={s.key} to={s.url}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
                <s.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{s.count}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
