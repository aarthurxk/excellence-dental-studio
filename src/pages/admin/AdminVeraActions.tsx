import { Fragment, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle, Bot, CheckCircle2, ChevronDown, ChevronRight, Clock3,
  Flame, Info, MessageSquare, RefreshCw, RotateCcw, Search, Send, ShieldCheck, XCircle,
} from "lucide-react";
import {
  HoverCard, HoverCardContent, HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Link } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { whatsappAdminChatUrl } from "@/lib/veraActions";

type VeraAction = {
  id: number;
  chat_id: string;
  channel: string | null;
  action_type: string;
  reason: string | null;
  score: number | null;
  prioridade: string | null;
  temperatura: string | null;
  ultimo_interesse: string | null;
  sinais: string[] | null;
  status: string;
  scheduled_for: string | null;
  source_workflow_id: string | null;
  response_text: string | null;
  lead_routing: Record<string, unknown> | null;
  created_at: string;
  updated_at: string | null;
  processed_at: string | null;
  delivery_mode: string | null;
  executor_note: string | null;
  last_error: string | null;
  patient_replied_after_action?: boolean;
};

type VeraActionsResponse = {
  ok: boolean;
  actions?: VeraAction[];
  counts?: Record<string, number>;
  updated?: VeraAction[];
  items?: Array<{
    id: number;
    decision: string;
    status: string;
    note: string;
    followup_text: string;
  }>;
  error?: string;
};

const STATUSES = ["all", "pending", "ignored", "simulated", "sent", "failed"];
const CHANNELS = ["all", "whatsapp", "website", "telegram_test", "site"];
const PRIORIDADES = ["all", "alta", "media", "baixa"];
const TEMPERATURAS = ["all", "quente", "morno", "frio"];

function statusClass(status: string) {
  switch (status) {
    case "pending": return "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-400";
    case "ignored": return "border-slate-500/30 bg-slate-500/15 text-slate-700 dark:text-slate-300";
    case "simulated": return "border-blue-500/30 bg-blue-500/15 text-blue-700 dark:text-blue-400";
    case "sent": return "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
    case "failed": return "border-rose-500/30 bg-rose-500/15 text-rose-700 dark:text-rose-400";
    default: return "border-border bg-muted text-muted-foreground";
  }
}

function priorityClass(priority: string | null) {
  switch (priority) {
    case "alta": return "border-rose-500/30 bg-rose-500/15 text-rose-700 dark:text-rose-400";
    case "media": return "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-400";
    case "baixa": return "border-blue-500/30 bg-blue-500/15 text-blue-700 dark:text-blue-400";
    default: return "border-border bg-muted text-muted-foreground";
  }
}

function fmtDate(value: string | null | undefined) {
  if (!value) return "-";
  try {
    return format(new Date(value), "dd/MM/yy HH:mm", { locale: ptBR });
  } catch {
    return value;
  }
}

function relativeDate(value: string | null | undefined) {
  if (!value) return "-";
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true, locale: ptBR });
  } catch {
    return value;
  }
}

async function callVeraActions(body: Record<string, unknown>): Promise<VeraActionsResponse> {
  const { data, error } = await supabase.functions.invoke("vera-lead-actions", { body });
  if (error) throw error;
  const payload = data as VeraActionsResponse;
  if (payload?.error) throw new Error(payload.error);
  return payload;
}

export default function AdminVeraActions() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("pending");
  const [channel, setChannel] = useState("all");
  const [prioridade, setPrioridade] = useState("all");
  const [temperatura, setTemperatura] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [markDialog, setMarkDialog] = useState<{ id: number; status: "ignored" | "pending" } | null>(null);
  const [note, setNote] = useState("");
  const [simulation, setSimulation] = useState<{ actionId: number; text: string; decision: string; note: string } | null>(null);

  const query = useQuery({
    queryKey: ["vera-lead-actions", status, channel, prioridade, temperatura, search],
    queryFn: () => callVeraActions({
      action: "list",
      status_filter: status,
      channel_filter: channel,
      prioridade_filter: prioridade,
      temperatura_filter: temperatura,
      search,
      limit: 200,
      include_future: true,
    }),
    refetchOnWindowFocus: false,
  });

  const markMutation = useMutation({
    mutationFn: ({ id, targetStatus, noteText }: { id: number; targetStatus: string; noteText: string }) =>
      callVeraActions({
        action: "mark",
        action_id: id,
        target_status: targetStatus,
        note: noteText,
        include_future: true,
      }),
    onSuccess: () => {
      toast.success("Action atualizada");
      setMarkDialog(null);
      setNote("");
      qc.invalidateQueries({ queryKey: ["vera-lead-actions"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const simulateMutation = useMutation({
    mutationFn: (id: number) => callVeraActions({ action: "simulate", action_id: id }),
    onSuccess: (data, id) => {
      const item = data.items?.[0];
      setSimulation({
        actionId: id,
        text: item?.followup_text || "",
        decision: item?.decision || "-",
        note: item?.note || "",
      });
    },
    onError: (error) => toast.error(error.message),
  });

  const actions = query.data?.actions ?? [];
  const counts = query.data?.counts ?? {};

  const filteredCount = useMemo(() => actions.length, [actions]);

  function toggle(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openMark(id: number, targetStatus: "ignored" | "pending") {
    setNote("");
    setMarkDialog({ id, status: targetStatus });
  }

  function confirmMark() {
    if (!markDialog) return;
    markMutation.mutate({
      id: markDialog.id,
      targetStatus: markDialog.status,
      noteText: note.trim() || (markDialog.status === "ignored" ? "Ignorado manualmente no painel" : "Reaberto manualmente no painel"),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-display font-semibold">
            <Bot className="h-6 w-6 text-primary" />
            Acoes Vera
          </h1>
          <p className="text-sm text-muted-foreground">
            Fila operacional de follow-up e handoff gerada pela inteligencia da Vera.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => query.refetch()} disabled={query.isFetching}>
          <RefreshCw className={`mr-2 h-4 w-4 ${query.isFetching ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        <Metric icon={Clock3} label="Pendentes" value={counts.pending ?? 0} />
        <Metric icon={Flame} label="Quentes" value={counts.hot ?? 0} />
        <Metric icon={AlertTriangle} label="Alta prioridade" value={counts.high_priority ?? 0} />
        <Metric icon={CheckCircle2} label="Enviadas" value={counts.sent ?? 0} />
        <Metric icon={XCircle} label="Falhas" value={counts.failed ?? 0} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <FilterSelect label="Status" value={status} values={STATUSES} onChange={setStatus} />
          <FilterSelect label="Canal" value={channel} values={CHANNELS} onChange={setChannel} />
          <FilterSelect label="Prioridade" value={prioridade} values={PRIORIDADES} onChange={setPrioridade} />
          <FilterSelect label="Temperatura" value={temperatura} values={TEMPERATURAS} onChange={setTemperatura} />
          <div className="space-y-1.5">
            <Label className="text-xs">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="chat, motivo, interesse"
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Status</TableHead>
                <TableHead>Quando</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.isLoading && (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                    Carregando actions...
                  </TableCell>
                </TableRow>
              )}
              {!query.isLoading && filteredCount === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                    Nenhuma action encontrada.
                  </TableCell>
                </TableRow>
              )}
              {actions.map((action) => {
                const isOpen = expanded.has(action.id);
                return (
                  <Fragment key={action.id}>
                    <TableRow key={action.id}>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggle(action.id)}>
                          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusClass(action.status)}>{action.status}</Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        <div>{fmtDate(action.scheduled_for || action.created_at)}</div>
                        <div className="text-[11px] text-muted-foreground">{relativeDate(action.scheduled_for || action.created_at)}</div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{action.channel || "-"}</Badge></TableCell>
                      <TableCell className="max-w-[190px] truncate font-mono text-xs">{action.chat_id}</TableCell>
                      <TableCell className="max-w-[230px] truncate text-sm">{action.reason || "-"}</TableCell>
                      <TableCell>{action.score ?? 0}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={priorityClass(action.prioridade)}>{action.prioridade || "-"}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {whatsappAdminChatUrl(action.chat_id) && (
                            <Button size="sm" variant="outline" asChild>
                              <Link to={whatsappAdminChatUrl(action.chat_id)}>
                                <MessageSquare className="mr-1 h-3.5 w-3.5" />
                                Chat
                              </Link>
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => simulateMutation.mutate(action.id)} disabled={simulateMutation.isPending}>
                            <Send className="mr-1 h-3.5 w-3.5" />
                            Simular
                          </Button>
                          {action.status === "pending" ? (
                            <Button size="sm" variant="ghost" onClick={() => openMark(action.id, "ignored")}>
                              Ignorar
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => openMark(action.id, "pending")}>
                              <RotateCcw className="mr-1 h-3.5 w-3.5" />
                              Reabrir
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    {isOpen && (
                      <TableRow key={`${action.id}-detail`} className="bg-muted/30 hover:bg-muted/30">
                        <TableCell />
                        <TableCell colSpan={8} className="space-y-3 py-4">
                          <div className="grid gap-3 md:grid-cols-3">
                            <Detail label="Temperatura" value={action.temperatura || "-"} />
                            <Detail label="Interesse" value={action.ultimo_interesse || "-"} />
                            <Detail label="Paciente respondeu depois?" value={action.patient_replied_after_action ? "sim" : "nao"} />
                            <Detail label="Criada" value={fmtDate(action.created_at)} />
                            <Detail label="Processada" value={fmtDate(action.processed_at)} />
                            <Detail label="Entrega" value={action.delivery_mode || "-"} />
                          </div>
                          {action.sinais?.length ? (
                            <div className="flex flex-wrap gap-1">
                              {action.sinais.map((signal) => (
                                <Badge key={signal} variant="secondary" className="text-[11px]">{signal}</Badge>
                              ))}
                            </div>
                          ) : null}
                          {action.executor_note && (
                            <div>
                              <div className="mb-1 text-[11px] font-medium uppercase text-muted-foreground">Nota executor</div>
                              <p className="text-sm">{action.executor_note}</p>
                            </div>
                          )}
                          {action.last_error && (
                            <div className="rounded border border-rose-500/30 bg-rose-500/10 p-2 text-sm text-rose-700 dark:text-rose-400">
                              {action.last_error}
                            </div>
                          )}
                          {action.response_text && (
                            <div>
                              <div className="mb-1 text-[11px] font-medium uppercase text-muted-foreground">Resposta que gerou a action</div>
                              <p className="whitespace-pre-wrap text-sm">{action.response_text}</p>
                            </div>
                          )}
                          {action.lead_routing && (
                            <div>
                              <div className="mb-1 text-[11px] font-medium uppercase text-muted-foreground">Lead routing</div>
                              <pre className="max-h-52 overflow-auto rounded border bg-background/70 p-2 text-[11px]">
                                {JSON.stringify(action.lead_routing, null, 2)}
                              </pre>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!markDialog} onOpenChange={(open) => !open && setMarkDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{markDialog?.status === "ignored" ? "Ignorar action" : "Reabrir action"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs">Nota</Label>
            <Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMarkDialog(null)}>Cancelar</Button>
            <Button onClick={confirmMark} disabled={markMutation.isPending}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!simulation} onOpenChange={(open) => !open && setSimulation(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Simulacao segura
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Detail label="Action" value={String(simulation?.actionId ?? "-")} />
            <Detail label="Decisao" value={simulation?.decision ?? "-"} />
            <Detail label="Nota" value={simulation?.note ?? "-"} />
            <div>
              <div className="mb-1 text-[11px] font-medium uppercase text-muted-foreground">Texto que seria usado</div>
              <p className="whitespace-pre-wrap rounded border bg-muted/40 p-3 text-sm">
                {simulation?.text || "Nenhum texto retornado."}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setSimulation(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Clock3; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-xl font-semibold leading-none">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterSelect({ label, value, values, onChange }: { label: string; value: string; values: string[]; onChange: (value: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {values.map((item) => (
            <SelectItem key={item} value={item}>{item === "all" ? "Todos" : item}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase text-muted-foreground">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}
