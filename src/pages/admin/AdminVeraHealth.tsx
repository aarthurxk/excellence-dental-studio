import { useMemo } from "react";
import type { ComponentType } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Repeat2,
  ListChecks,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { summarizeVeraHealth, type VeraActionHealthItem, type VeraConversationHealthItem } from "@/lib/veraHealth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type VeraActionsResponse = {
  actions?: VeraActionHealthItem[];
  error?: string;
};

type VeraLogsResponse = {
  contatos?: VeraConversationHealthItem[];
  error?: string;
};

type ConnectionLog = {
  status: string | null;
  created_at: string | null;
  disconnect_reason?: string | null;
};

type AuditRow = {
  acao: string | null;
  tabela: string | null;
  criado_em: string | null;
  user_email: string | null;
};

function fmtRelative(value?: string | null) {
  if (!value) return "-";
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true, locale: ptBR });
  } catch {
    return value;
  }
}

function healthBadge(label: string) {
  if (label === "ok") return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
  if (label === "attention") return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
  return "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30";
}

async function fetchActions() {
  const { data, error } = await supabase.functions.invoke("vera-lead-actions", {
    body: { action: "list", status_filter: "all", limit: 200 },
  });
  if (error) throw error;
  const payload = data as VeraActionsResponse;
  if (payload.error) throw new Error(payload.error);
  return payload.actions ?? [];
}

async function fetchVeraLogs() {
  const { data, error } = await supabase.functions.invoke("vera-conversation-logs", { body: {} });
  if (error) throw error;
  const payload = data as VeraLogsResponse;
  if (payload.error) throw new Error(payload.error);
  return payload.contatos ?? [];
}

export default function AdminVeraHealth() {
  const actionsQuery = useQuery({
    queryKey: ["vera-health-actions"],
    queryFn: fetchActions,
    refetchInterval: 60_000,
  });

  const logsQuery = useQuery({
    queryKey: ["vera-health-logs"],
    queryFn: fetchVeraLogs,
    refetchInterval: 60_000,
  });

  const connectionQuery = useQuery({
    queryKey: ["vera-health-connection"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("connection_logs")
        .select("status, created_at, disconnect_reason")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as ConnectionLog[];
    },
    refetchInterval: 60_000,
  });

  const auditQuery = useQuery({
    queryKey: ["vera-health-audit"],
    queryFn: async () => {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("vera_audit_log")
        .select("acao, tabela, criado_em, user_email")
        .gte("criado_em", since)
        .order("criado_em", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as AuditRow[];
    },
    refetchInterval: 60_000,
  });

  const summariesQuery = useQuery({
    queryKey: ["vera-health-summaries"],
    queryFn: async () => {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count, error } = await supabase
        .from("vera_resumos")
        .select("*", { count: "exact", head: true })
        .gte("criado_em", since);
      if (error) throw error;
      return count ?? 0;
    },
    refetchInterval: 120_000,
  });

  const statesQuery = useQuery({
    queryKey: ["vera-health-states"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("vera_conversation_state")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
    refetchInterval: 120_000,
  });

  const summary = useMemo(
    () =>
      summarizeVeraHealth({
        actions: actionsQuery.data,
        conversations: logsQuery.data,
        audits: auditQuery.data ?? [],
        connectionLogs: connectionQuery.data ?? [],
        summariesCount: summariesQuery.data ?? 0,
        statesCount: statesQuery.data ?? 0,
      }),
    [actionsQuery.data, auditQuery.data, connectionQuery.data, logsQuery.data, statesQuery.data, summariesQuery.data],
  );

  const isFetching =
    actionsQuery.isFetching ||
    logsQuery.isFetching ||
    connectionQuery.isFetching ||
    auditQuery.isFetching ||
    summariesQuery.isFetching ||
    statesQuery.isFetching;

  const errors = [
    actionsQuery.error,
    logsQuery.error,
    connectionQuery.error,
    auditQuery.error,
    summariesQuery.error,
    statesQuery.error,
  ].filter(Boolean) as Error[];

  function refetchAll() {
    actionsQuery.refetch();
    logsQuery.refetch();
    connectionQuery.refetch();
    auditQuery.refetch();
    summariesQuery.refetch();
    statesQuery.refetch();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Saude Vera
          </h1>
          <p className="text-sm text-muted-foreground">
            Sinais operacionais da IA, follow-ups, logs e conexao WhatsApp.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refetchAll} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      <Card>
        <CardContent className="p-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full border flex items-center justify-center bg-background">
              {summary.label === "ok" ? (
                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
              ) : (
                <AlertTriangle className="h-7 w-7 text-amber-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">{summary.score}</span>
                <Badge variant="outline" className={healthBadge(summary.label)}>{summary.label}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Score operacional calculado com sinais dos ultimos dados disponiveis.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <div className="text-muted-foreground">WhatsApp</div>
              <div className="font-medium">{summary.whatsappStatus}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Conversas</div>
              <div className="font-medium">{summary.conversationCount}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Actions abertas</div>
              <div className="font-medium">{summary.openActions}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Auditoria 24h</div>
              <div className="font-medium">{summary.recentAuditCount}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {errors.length > 0 && (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Erros ao carregar sinais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {errors.map((error, index) => (
              <p key={`${error.message}-${index}`}>{error.message}</p>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard icon={ListChecks} title="Actions abertas" value={summary.openActions} detail={`${summary.failedActions} falha(s), ${summary.staleActions} antigas`} />
        <MetricCard icon={MessageCircle} title="Conversas Vera" value={summary.conversationCount} detail={`${summary.activeConversations24h} ativas em 24h`} />
        <MetricCard icon={Clock} title="Resumos 7 dias" value={summary.summariesCount} detail={`${summary.statesCount} estados SPIN salvos`} />
        <MetricCard icon={Smartphone} title="Conexao WA" value={summary.whatsappStatus} detail={`ultimo evento ${fmtRelative(connectionQuery.data?.[0]?.created_at)}`} />
        <MetricCard icon={Repeat2} title="Repeticoes IA" value={summary.repeatedAiResponses} detail={`${summary.scheduleMentions} mencoes de agenda`} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Pontos de atencao
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.issues.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum ponto critico detectado nos sinais atuais.</p>
            ) : (
              <div className="space-y-2">
                {summary.issues.map((issue) => (
                  <div key={issue} className="flex items-center gap-2 text-sm">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    {issue}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Auditoria recente
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quando</TableHead>
                  <TableHead>Acao</TableHead>
                  <TableHead>Usuario</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(auditQuery.data ?? []).slice(0, 8).map((row, index) => (
                  <TableRow key={`${row.acao}-${row.criado_em}-${index}`}>
                    <TableCell className="text-xs whitespace-nowrap">{fmtRelative(row.criado_em)}</TableCell>
                    <TableCell className="text-xs">{row.acao ?? "-"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{row.user_email ?? "sistema"}</TableCell>
                  </TableRow>
                ))}
                {(auditQuery.data ?? []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-sm text-muted-foreground py-8">
                      Nenhum registro recente.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  title,
  value,
  detail,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  value: number | string;
  detail: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{detail}</p>
      </CardContent>
    </Card>
  );
}
