import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { evoProxy } from "@/hooks/useEvoProxy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Wifi, WifiOff, MessageSquare, Users, CalendarDays, RefreshCw,
  AlertTriangle, Clock, PlugZap, Activity, RotateCw, LogOut, QrCode, Hash,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// ─── QR Code Modal Component ───
interface QRCodeModalProps {
  isOpen: boolean;
  base64: string;
  onClose: () => void;
  onRegenerateQR: () => void;
  isConnected: boolean;
}

function QRCodeModal({ isOpen, base64, onClose, onRegenerateQR, isConnected }: QRCodeModalProps) {
  const [countdown, setCountdown] = useState(20);

  useEffect(() => {
    if (!isOpen) return;
    if (isConnected) {
      onClose();
      return;
    }
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isConnected, onClose]);

  const srcData = base64.startsWith("data:") ? base64 : `data:image/png;base64,${base64}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Escaneie o código QR para reconectar</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <img src={srcData} alt="QR Code" className="w-64 h-64 border-4 border-border rounded" />
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Código expira em:</p>
            <p className={`text-2xl font-bold ${countdown <= 5 ? "text-destructive" : "text-foreground"}`}>{countdown}s</p>
          </div>
          <Button onClick={onRegenerateQR} variant="outline" className="w-full">
            Gerar Novo QR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Conexão / Uptime Tab Content ───
interface ConnectionLog { id: string; status: string; disconnect_reason: string | null; created_at: string; }

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
  return { pct24h: pct(logs24), events24h: logs24.length, pct7d: pct(logs7), events7d: logs7.length };
}

function ConexaoTab() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<string>("unknown");
  const [checking, setChecking] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [logging, setLogging] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [logs, setLogs] = useState<ConnectionLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [isQROpen, setIsQROpen] = useState(false);
  const [qrBase64, setQrBase64] = useState("");

  useEffect(() => { checkStatus(); fetchLogs(); }, []);

  async function checkStatus() {
    setChecking(true);
    try { const res = await evoProxy<{ instance?: { state?: string } }>("connectionState"); setStatus(res?.instance?.state ?? "unknown"); } catch { setStatus("error"); }
    setChecking(false);
  }

  async function handleReconnect() {
    setReconnecting(true);
    try {
      const res = await evoProxy<{ pairingCode?: string; code?: string; base64?: string }>("connect");
      if (res?.base64) {
        setQrBase64(res.base64);
        setIsQROpen(true);
      } else {
        toast.success(`Reconectando... Código: ${res.pairingCode || res.code || "Enviado"}`);
      }
      setTimeout(checkStatus, 3000);
    } catch { toast.error("Erro ao reconectar"); }
    setReconnecting(false);
  }

  async function handleLogout() {
    setLogging(true);
    try {
      await evoProxy("logout");
      toast.success("Desconectado com sucesso");
      qc.invalidateQueries({ queryKey: ["evo-connection"] });
      setTimeout(checkStatus, 2000);
    } catch { toast.error("Erro ao desconectar"); }
    setLogging(false);
  }

  async function handleRestart() {
    setRestarting(true);
    try {
      await evoProxy("restart");
      toast.success("Reiniciando instância...");
      qc.invalidateQueries({ queryKey: ["evo-connection"] });
      setTimeout(checkStatus, 3000);
    } catch { toast.error("Erro ao reiniciar"); }
    setRestarting(false);
  }

  async function fetchLogs() {
    const { data } = await supabase.from("connection_logs").select("*").order("created_at", { ascending: false }).limit(50);
    setLogs((data as ConnectionLog[]) ?? []);
    setLoadingLogs(false);
  }

  const uptimeStats = computeUptime(logs);
  const isOnline = status === "open";

  return (
    <>
      <QRCodeModal isOpen={isQROpen} base64={qrBase64} onClose={() => setIsQROpen(false)} onRegenerateQR={handleReconnect} isConnected={isOnline} />
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Status Atual</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-3">
              {isOnline ? <Wifi className="h-8 w-8 text-green-500" /> : <WifiOff className="h-8 w-8 text-destructive" />}
              <div className="flex-1">
                <p className="text-2xl font-bold">{isOnline ? "Online" : status === "error" ? "Erro" : status}</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <Button size="sm" variant="outline" onClick={checkStatus} disabled={checking}>
                    <RefreshCw className={`h-3 w-3 mr-1 ${checking ? "animate-spin" : ""}`} /> Verificar
                  </Button>
                  {!isOnline && <Button size="sm" onClick={handleReconnect} disabled={reconnecting}>{reconnecting ? "Reconectando..." : "Reconectar"}</Button>}
                  {isOnline && <Button size="sm" variant="outline" onClick={handleRestart} disabled={restarting}><RotateCw className="h-3 w-3 mr-1" /> {restarting ? "Reiniciando..." : "Reiniciar"}</Button>}
                  {isOnline && <Button size="sm" variant="outline" onClick={handleLogout} disabled={logging}><LogOut className="h-3 w-3 mr-1" /> {logging ? "Desconectando..." : "Desconectar"}</Button>}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Uptime 24h</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{uptimeStats.pct24h}%</p><p className="text-xs text-muted-foreground mt-1">{uptimeStats.events24h} eventos</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Uptime 7 dias</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{uptimeStats.pct7d}%</p><p className="text-xs text-muted-foreground mt-1">{uptimeStats.events7d} eventos</p></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Timeline de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingLogs ? <p className="text-muted-foreground text-sm">Carregando...</p> : logs.length === 0 ? <p className="text-muted-foreground text-sm">Nenhum evento registrado.</p> : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                    <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${log.status === "open" || log.status === "connected" ? "bg-green-500" : log.status === "close" || log.status === "disconnected" ? "bg-destructive" : "bg-yellow-500"}`} />
                    <div className="flex-1 min-w-0">
                      <Badge variant={log.status === "open" || log.status === "connected" ? "default" : "destructive"} className="text-[10px]">{log.status}</Badge>
                      {log.disconnect_reason && <span className="text-xs text-muted-foreground ml-2 truncate">{log.disconnect_reason}</span>}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{format(new Date(log.created_at), "dd/MM HH:mm:ss")}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// ─── KPI Skeleton ───
function KPISkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-5 w-5 rounded" /></CardHeader>
      <CardContent><Skeleton className="h-8 w-16" /></CardContent>
    </Card>
  );
}

// ─── Dashboard Tab Content ───
function DashboardTab() {
  const qc = useQueryClient();
  const { data: connStatus, isLoading: connLoading } = useQuery({ queryKey: ["evo-connection"], queryFn: () => evoProxy<{ instance: { instanceName: string; state: string } }>("connectionState"), refetchInterval: 30_000 });
  const isConnected = connStatus?.instance?.state === "open";
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

  const { data: msgCountToday = 0, isLoading: msgLoading } = useQuery({ queryKey: ["wha-msgs-today"], queryFn: async () => { const { count } = await supabase.from("conversations_log").select("*", { count: "exact", head: true }).gte("created_at", todayStart.toISOString()); return count ?? 0; } });
  const { data: newLeadsToday = 0, isLoading: leadsLoading } = useQuery({ queryKey: ["wha-leads-today"], queryFn: async () => { const { count } = await supabase.from("leads").select("*", { count: "exact", head: true }).gte("created_at", todayStart.toISOString()); return count ?? 0; } });
  const { data: appointmentsToday = 0, isLoading: apptsLoading } = useQuery({ queryKey: ["wha-appts-today"], queryFn: async () => { const { count } = await supabase.from("appointments").select("*", { count: "exact", head: true }).gte("scheduled_at", todayStart.toISOString()).lt("scheduled_at", new Date(todayStart.getTime() + 86400000).toISOString()).eq("status", "confirmed"); return count ?? 0; } });
  const { data: recentDisconnects = [], isLoading: disconnectsLoading } = useQuery({ queryKey: ["wha-disconnects"], queryFn: async () => { const { data } = await supabase.from("connection_logs").select("*").order("created_at", { ascending: false }).limit(5); return data ?? []; } });
  const { data: unansweredLeads = 0 } = useQuery({ queryKey: ["wha-unanswered"], queryFn: async () => { const { count } = await supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "novo").eq("total_messages_out", 0); return count ?? 0; } });

  const [reconnecting, setReconnecting] = useState(false);
  const [logging, setLogging] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const [qrBase64, setQrBase64] = useState("");

  const handleReconnect = async () => {
    setReconnecting(true);
    try {
      const res = await evoProxy<{ pairingCode?: string; code?: string; base64?: string }>("connect");
      if (res?.base64) {
        setQrBase64(res.base64);
        setIsQROpen(true);
      } else {
        toast.success(`Reconectando... Código: ${res.pairingCode || res.code || "Enviado"}`);
      }
      qc.invalidateQueries({ queryKey: ["evo-connection"] });
    } catch (e: any) { toast.error("Erro ao reconectar: " + e.message); } finally { setReconnecting(false); }
  };

  const handleLogout = async () => {
    setLogging(true);
    try {
      await evoProxy("logout");
      toast.success("Desconectado com sucesso");
      qc.invalidateQueries({ queryKey: ["evo-connection"] });
    } catch { toast.error("Erro ao desconectar"); }
    setLogging(false);
  };

  const handleRestart = async () => {
    setRestarting(true);
    try {
      await evoProxy("restart");
      toast.success("Reiniciando instância...");
      qc.invalidateQueries({ queryKey: ["evo-connection"] });
    } catch { toast.error("Erro ao reiniciar"); }
    setRestarting(false);
  };

  useEffect(() => {
    const channel = supabase.channel("connection-logs-rt").on("postgres_changes", { event: "INSERT", schema: "public", table: "connection_logs" }, () => { qc.invalidateQueries({ queryKey: ["wha-disconnects"] }); qc.invalidateQueries({ queryKey: ["evo-connection"] }); }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc]);

  const refreshAll = () => { ["evo-connection", "wha-msgs-today", "wha-leads-today", "wha-appts-today", "wha-disconnects", "wha-unanswered"].forEach((k) => qc.invalidateQueries({ queryKey: [k] })); };
  const kpisLoading = msgLoading || leadsLoading || apptsLoading;

  return (
    <>
      <QRCodeModal isOpen={isQROpen} base64={qrBase64} onClose={() => setIsQROpen(false)} onRegenerateQR={handleReconnect} isConnected={isConnected} />
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={refreshAll}><RefreshCw className="h-4 w-4 mr-2" /> Atualizar</Button>
        </div>

        {connLoading ? (
          <Card><CardContent className="flex items-center gap-4 p-6"><Skeleton className="h-12 w-12 rounded-full" /><div className="space-y-2"><Skeleton className="h-5 w-32" /><Skeleton className="h-4 w-48" /></div></CardContent></Card>
        ) : (
          <Card className={isConnected ? "border-green-500/50" : "border-red-500/50"}>
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isConnected ? "bg-green-500/10" : "bg-red-500/10"}`}>
                  {isConnected ? <Wifi className="h-6 w-6 text-green-500" /> : <WifiOff className="h-6 w-6 text-red-500" />}
                </div>
                <div>
                  <p className="font-semibold text-lg">{isConnected ? "Conectado" : "Desconectado"}</p>
                  <p className="text-sm text-muted-foreground">Instância: {connStatus?.instance?.instanceName || "vera-whatsapp"}</p>
                </div>
              </div>
              {!isConnected && <Button onClick={handleReconnect} disabled={reconnecting}><PlugZap className="h-4 w-4 mr-2" />{reconnecting ? "Reconectando..." : "Reconectar"}</Button>}
              {isConnected && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleRestart} disabled={restarting}><RotateCw className="h-4 w-4 mr-2" /> {restarting ? "Reiniciando..." : "Reiniciar"}</Button>
                  <Button size="sm" variant="outline" onClick={handleLogout} disabled={logging}><LogOut className="h-4 w-4 mr-2" /> {logging ? "Desconectando..." : "Desconectar"}</Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpisLoading ? Array.from({ length: 4 }).map((_, i) => <KPISkeleton key={i} />) : (
            <>
              <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Mensagens Hoje</CardTitle><MessageSquare className="h-5 w-5 text-muted-foreground" /></CardHeader><CardContent><p className="text-3xl font-bold">{msgCountToday}</p></CardContent></Card>
              <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Novos Leads Hoje</CardTitle><Users className="h-5 w-5 text-muted-foreground" /></CardHeader><CardContent><p className="text-3xl font-bold">{newLeadsToday}</p></CardContent></Card>
              <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle><CalendarDays className="h-5 w-5 text-muted-foreground" /></CardHeader><CardContent><p className="text-3xl font-bold">{appointmentsToday}</p></CardContent></Card>
              <Card className={unansweredLeads > 0 ? "border-amber-500/50" : ""}><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Sem Resposta</CardTitle><AlertTriangle className={`h-5 w-5 ${unansweredLeads > 0 ? "text-amber-500" : "text-muted-foreground"}`} /></CardHeader><CardContent><p className="text-3xl font-bold">{unansweredLeads}</p></CardContent></Card>
            </>
          )}
        </div>

        {disconnectsLoading ? (
          <Card><CardHeader><Skeleton className="h-5 w-48" /></CardHeader><CardContent className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="flex items-center justify-between border-b pb-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-3 w-24" /></div>)}</CardContent></Card>
        ) : recentDisconnects.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Últimos Eventos de Conexão</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentDisconnects.map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                    <div className="flex items-center gap-2">
                      <Badge variant={log.status === "open" ? "default" : "destructive"} className="text-xs">{log.status}</Badge>
                      {log.disconnect_reason && <span className="text-muted-foreground">{log.disconnect_reason}</span>}
                    </div>
                    <span className="text-muted-foreground">{log.created_at ? formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: ptBR }) : "—"}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

// ─── Main Page ───
export default function AdminWhatsApp() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold">WhatsApp Dashboard</h2>
      <Tabs defaultValue="dashboard">
        <TabsList className="w-fit">
          <TabsTrigger value="dashboard" className="gap-1.5"><MessageSquare className="h-4 w-4" /> Dashboard</TabsTrigger>
          <TabsTrigger value="conexao" className="gap-1.5"><Activity className="h-4 w-4" /> Conexão / Uptime</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="mt-4"><DashboardTab /></TabsContent>
        <TabsContent value="conexao" className="mt-4"><ConexaoTab /></TabsContent>
      </Tabs>
    </div>
  );
}
