import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { evoProxy } from "@/hooks/useEvoProxy";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Wifi, WifiOff, RefreshCw, Activity, Clock } from "lucide-react";
import { format } from "date-fns";

interface ConnectionLog {
  id: string;
  status: string;
  disconnect_reason: string | null;
  created_at: string;
}

export default function AdminConexao() {
  const { role } = useAuth();
  const [status, setStatus] = useState<string>("unknown");
  const [checking, setChecking] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [logs, setLogs] = useState<ConnectionLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    checkStatus();
    fetchLogs();
  }, []);

  async function checkStatus() {
    setChecking(true);
    try {
      const res = await evoProxy<{ instance?: { state?: string } }>("connectionState");
      setStatus(res?.instance?.state ?? "unknown");
    } catch {
      setStatus("error");
    }
    setChecking(false);
  }

  async function handleReconnect() {
    setReconnecting(true);
    try {
      await evoProxy("connect");
      toast.success("Solicitação de reconexão enviada");
      setTimeout(checkStatus, 3000);
    } catch {
      toast.error("Erro ao reconectar");
    }
    setReconnecting(false);
  }

  async function fetchLogs() {
    const { data } = await supabase
      .from("connection_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setLogs((data as ConnectionLog[]) ?? []);
    setLoadingLogs(false);
  }

  // Compute uptime from logs
  const uptimeStats = computeUptime(logs);

  if (role !== "admin" && role !== "socio") {
    return <p className="text-muted-foreground">Acesso restrito.</p>;
  }

  const isOnline = status === "open";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2"><Activity className="h-6 w-6" /> Monitoramento de Conexão</h2>
        <p className="text-muted-foreground text-sm">Status em tempo real e histórico da instância WhatsApp</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Status Atual</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            {isOnline ? <Wifi className="h-8 w-8 text-green-500" /> : <WifiOff className="h-8 w-8 text-destructive" />}
            <div>
              <p className="text-2xl font-bold">{isOnline ? "Online" : status === "error" ? "Erro" : status}</p>
              <div className="flex gap-2 mt-1">
                <Button size="sm" variant="outline" onClick={checkStatus} disabled={checking}>
                  <RefreshCw className={`h-3 w-3 mr-1 ${checking ? "animate-spin" : ""}`} /> Verificar
                </Button>
                {!isOnline && (
                  <Button size="sm" onClick={handleReconnect} disabled={reconnecting}>
                    {reconnecting ? "Reconectando..." : "Reconectar"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Uptime 24h */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Uptime 24h</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{uptimeStats.pct24h}%</p>
            <p className="text-xs text-muted-foreground mt-1">{uptimeStats.events24h} eventos registrados</p>
          </CardContent>
        </Card>

        {/* Uptime 7d */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Uptime 7 dias</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{uptimeStats.pct7d}%</p>
            <p className="text-xs text-muted-foreground mt-1">{uptimeStats.events7d} eventos registrados</p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Timeline de Eventos</CardTitle>
          <CardDescription>Últimos 50 eventos de conexão</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingLogs ? (
            <p className="text-muted-foreground text-sm">Carregando...</p>
          ) : logs.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum evento registrado.</p>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${log.status === "open" || log.status === "connected" ? "bg-green-500" : log.status === "close" || log.status === "disconnected" ? "bg-destructive" : "bg-yellow-500"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant={log.status === "open" || log.status === "connected" ? "default" : "destructive"} className="text-[10px]">
                        {log.status}
                      </Badge>
                      {log.disconnect_reason && (
                        <span className="text-xs text-muted-foreground truncate">{log.disconnect_reason}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(log.created_at), "dd/MM HH:mm:ss")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function computeUptime(logs: ConnectionLog[]) {
  const now = Date.now();
  const h24 = now - 24 * 60 * 60 * 1000;
  const d7 = now - 7 * 24 * 60 * 60 * 1000;

  const logs24 = logs.filter((l) => new Date(l.created_at).getTime() >= h24);
  const logs7 = logs.filter((l) => new Date(l.created_at).getTime() >= d7);

  const onlineStatuses = ["open", "connected"];

  function pct(subset: ConnectionLog[]) {
    if (subset.length === 0) return 100;
    const online = subset.filter((l) => onlineStatuses.includes(l.status)).length;
    return Math.round((online / subset.length) * 100);
  }

  return {
    pct24h: pct(logs24),
    events24h: logs24.length,
    pct7d: pct(logs7),
    events7d: logs7.length,
  };
}
