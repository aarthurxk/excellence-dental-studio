import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare, Users, TrendingUp, Clock, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, FunnelChart, Funnel, LabelList, Cell,
} from "recharts";
import { format, subDays, startOfDay, eachDayOfInterval, eachHourOfInterval, startOfHour } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMemo } from "react";

const FUNNEL_COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#22c55e", "#ef4444", "#6b7280"];
const STATUSES_ORDERED = [
  { key: "novo", label: "Novo" },
  { key: "qualificado", label: "Qualificado" },
  { key: "agendado", label: "Agendado" },
  { key: "compareceu", label: "Compareceu" },
  { key: "nao_compareceu", label: "Não Compareceu" },
  { key: "perdido", label: "Perdido" },
];

export default function AdminRelatorios() {
  // Messages last 30 days
  const { data: messages = [] } = useQuery({
    queryKey: ["report-msgs-30d"],
    queryFn: async () => {
      const since = subDays(new Date(), 30).toISOString();
      const { data } = await supabase
        .from("conversations_log")
        .select("direction, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: true });
      return data ?? [];
    },
  });

  // Leads all
  const { data: leads = [] } = useQuery({
    queryKey: ["report-leads-all"],
    queryFn: async () => {
      const { data } = await supabase.from("leads").select("status, created_at");
      return data ?? [];
    },
  });

  // Messages last 7 days for hourly chart
  const { data: msgs7d = [] } = useQuery({
    queryKey: ["report-msgs-7d"],
    queryFn: async () => {
      const since = subDays(new Date(), 7).toISOString();
      const { data } = await supabase
        .from("conversations_log")
        .select("direction, created_at")
        .gte("created_at", since);
      return data ?? [];
    },
  });

  // Appointments for conversion
  const { data: totalAppts = 0 } = useQuery({
    queryKey: ["report-appts-total"],
    queryFn: async () => {
      const { count } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  // KPIs
  const thisMonthStart = startOfDay(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const lastMonthStart = startOfDay(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1));

  const leadsThisMonth = leads.filter((l) => l.created_at && new Date(l.created_at) >= thisMonthStart).length;
  const leadsLastMonth = leads.filter(
    (l) => l.created_at && new Date(l.created_at) >= lastMonthStart && new Date(l.created_at) < thisMonthStart
  ).length;
  const leadsGrowth = leadsLastMonth === 0 ? 0 : Math.round(((leadsThisMonth - leadsLastMonth) / leadsLastMonth) * 100);

  const conversionRate = leads.length === 0 ? 0 : Math.round((totalAppts / leads.length) * 100);

  // Daily messages chart data
  const dailyData = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
    return days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayMsgs = messages.filter((m) => m.created_at?.startsWith(dayStr));
      return {
        date: format(day, "dd/MM"),
        recebidas: dayMsgs.filter((m) => m.direction === "incoming").length,
        enviadas: dayMsgs.filter((m) => m.direction === "outgoing").length,
      };
    });
  }, [messages]);

  // Funnel data
  const funnelData = useMemo(() => {
    return STATUSES_ORDERED.map((s) => ({
      name: s.label,
      value: leads.filter((l) => l.status === s.key).length,
    }));
  }, [leads]);

  // Hourly demand chart
  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map((h) => {
      const count = msgs7d.filter((m) => {
        if (!m.created_at) return false;
        return new Date(m.created_at).getHours() === h;
      }).length;
      return { hour: `${String(h).padStart(2, "0")}h`, mensagens: count };
    });
  }, [msgs7d]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold">Relatórios</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Leads Este Mês</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{leadsThisMonth}</p>
            <div className="flex items-center gap-1 text-xs mt-1">
              {leadsGrowth >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500" />
              )}
              <span className={leadsGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                {leadsGrowth}% vs mês anterior
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{leads.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{conversionRate}%</p>
            <p className="text-xs text-muted-foreground">Contato → Agendamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Msgs (30 dias)</CardTitle>
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{messages.length}</p>
            <div className="flex gap-2 text-xs text-muted-foreground mt-1">
              <span>📩 {messages.filter((m) => m.direction === "incoming").length}</span>
              <span>📤 {messages.filter((m) => m.direction === "outgoing").length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages per Day Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mensagens por Dia (30 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="recebidas" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="enviadas" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Funil de Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {funnelData.map((item, i) => {
                const maxVal = Math.max(...funnelData.map((f) => f.value), 1);
                const pct = (item.value / maxVal) * 100;
                return (
                  <div key={item.name} className="flex items-center gap-3">
                    <span className="text-sm w-[130px] shrink-0 truncate">{item.name}</span>
                    <div className="flex-1 h-7 rounded-md overflow-hidden bg-muted">
                      <div
                        className="h-full rounded-md flex items-center px-2 text-xs font-medium text-white transition-all"
                        style={{ width: `${Math.max(pct, 5)}%`, backgroundColor: FUNNEL_COLORS[i] }}
                      >
                        {item.value}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Hourly Demand */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Demanda por Horário (7 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="mensagens" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
