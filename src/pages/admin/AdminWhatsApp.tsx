import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { evoProxy } from "@/hooks/useEvoProxy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wifi, WifiOff, MessageSquare, Users, CalendarDays, RefreshCw,
  AlertTriangle, Clock, PlugZap,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function KPISkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-5 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16" />
      </CardContent>
    </Card>
  );
}

export default function AdminWhatsApp() {
  const qc = useQueryClient();

  const { data: connStatus, isLoading: connLoading } = useQuery({
    queryKey: ["evo-connection"],
    queryFn: () =>
      evoProxy<{ instance: { instanceName: string; state: string } }>("connectionState"),
    refetchInterval: 30_000,
  });

  const isConnected = connStatus?.instance?.state === "open";

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: msgCountToday = 0, isLoading: msgLoading } = useQuery({
    queryKey: ["wha-msgs-today"],
    queryFn: async () => {
      const { count } = await supabase
        .from("conversations_log")
        .select("*", { count: "exact", head: true })
        .gte("created_at", todayStart.toISOString());
      return count ?? 0;
    },
  });

  const { data: newLeadsToday = 0, isLoading: leadsLoading } = useQuery({
    queryKey: ["wha-leads-today"],
    queryFn: async () => {
      const { count } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .gte("created_at", todayStart.toISOString());
      return count ?? 0;
    },
  });

  const { data: appointmentsToday = 0, isLoading: apptsLoading } = useQuery({
    queryKey: ["wha-appts-today"],
    queryFn: async () => {
      const { count } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .gte("scheduled_at", todayStart.toISOString())
        .lt("scheduled_at", new Date(todayStart.getTime() + 86400000).toISOString())
        .eq("status", "confirmed");
      return count ?? 0;
    },
  });

  const { data: recentDisconnects = [], isLoading: disconnectsLoading } = useQuery({
    queryKey: ["wha-disconnects"],
    queryFn: async () => {
      const { data } = await supabase
        .from("connection_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const { data: unansweredLeads = 0 } = useQuery({
    queryKey: ["wha-unanswered"],
    queryFn: async () => {
      const { count } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("status", "novo")
        .eq("total_messages_out", 0);
      return count ?? 0;
    },
  });

  const [reconnecting, setReconnecting] = useState(false);
  const handleReconnect = async () => {
    setReconnecting(true);
    try {
      const res = await evoProxy<{ pairingCode?: string; code?: string }>("connect");
      toast.success(`Reconectando... Código: ${res.pairingCode || res.code || "Enviado"}`);
      qc.invalidateQueries({ queryKey: ["evo-connection"] });
    } catch (e: any) {
      toast.error("Erro ao reconectar: " + e.message);
    } finally {
      setReconnecting(false);
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel("connection-logs-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "connection_logs" }, () => {
        qc.invalidateQueries({ queryKey: ["wha-disconnects"] });
        qc.invalidateQueries({ queryKey: ["evo-connection"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc]);

  const refreshAll = () => {
    qc.invalidateQueries({ queryKey: ["evo-connection"] });
    qc.invalidateQueries({ queryKey: ["wha-msgs-today"] });
    qc.invalidateQueries({ queryKey: ["wha-leads-today"] });
    qc.invalidateQueries({ queryKey: ["wha-appts-today"] });
    qc.invalidateQueries({ queryKey: ["wha-disconnects"] });
    qc.invalidateQueries({ queryKey: ["wha-unanswered"] });
  };

  const kpisLoading = msgLoading || leadsLoading || apptsLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold">WhatsApp Dashboard</h2>
        <Button variant="outline" size="sm" onClick={refreshAll}>
          <RefreshCw className="h-4 w-4 mr-2" /> Atualizar
        </Button>
      </div>

      {/* Connection Status */}
      {connLoading ? (
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className={isConnected ? "border-green-500/50" : "border-red-500/50"}>
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              {isConnected ? (
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Wifi className="h-6 w-6 text-green-500" />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <WifiOff className="h-6 w-6 text-red-500" />
                </div>
              )}
              <div>
                <p className="font-semibold text-lg">
                  {isConnected ? "Conectado" : "Desconectado"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Instância: {connStatus?.instance?.instanceName || "vera-whatsapp"}
                </p>
              </div>
            </div>
            {!isConnected && (
              <Button onClick={handleReconnect} disabled={reconnecting}>
                <PlugZap className="h-4 w-4 mr-2" />
                {reconnecting ? "Reconectando..." : "Reconectar"}
              </Button>
            )}
            {isConnected && (
              <Badge variant="outline" className="text-green-600 border-green-500">
                ● Online
              </Badge>
            )}
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpisLoading ? (
          Array.from({ length: 4 }).map((_, i) => <KPISkeleton key={i} />)
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Mensagens Hoje</CardTitle>
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{msgCountToday}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Novos Leads Hoje</CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{newLeadsToday}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{appointmentsToday}</p>
              </CardContent>
            </Card>

            <Card className={unansweredLeads > 0 ? "border-amber-500/50" : ""}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Sem Resposta</CardTitle>
                <AlertTriangle className={`h-5 w-5 ${unansweredLeads > 0 ? "text-amber-500" : "text-muted-foreground"}`} />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{unansweredLeads}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Alerts */}
      {disconnectsLoading ? (
        <Card>
          <CardHeader><Skeleton className="h-5 w-48" /></CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : recentDisconnects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" /> Últimos Eventos de Conexão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentDisconnects.map((log) => (
                <div key={log.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={log.status === "open" ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {log.status}
                    </Badge>
                    {log.disconnect_reason && (
                      <span className="text-muted-foreground">{log.disconnect_reason}</span>
                    )}
                  </div>
                  <span className="text-muted-foreground">
                    {log.created_at
                      ? formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: ptBR })
                      : "—"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
