import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { HandHelping, RefreshCw, CheckCircle2, UserCheck, ChevronDown, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

type Handoff = {
  id: number;
  chat_id: string;
  channel: string;
  motivo: string;
  status: string;
  payload: Record<string, unknown> | null;
  notas: string | null;
  criado_em: string | null;
  assumido_em: string | null;
  assumido_por: string | null;
  resolvido_em: string | null;
};

const STATUSES = ["pendente", "assumido", "resolvido"];
const CHANNELS = ["whatsapp", "site", "instagram", "outro"];

function statusColor(s: string) {
  switch (s) {
    case "pendente": return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
    case "assumido": return "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30";
    case "resolvido": return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
    default: return "bg-muted text-muted-foreground";
  }
}

export default function AdminHandoff() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [status, setStatus] = useState<string>("pendente");
  const [channel, setChannel] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [noteDialog, setNoteDialog] = useState<{ id: number; action: "assumir" | "resolver" } | null>(null);
  const [noteText, setNoteText] = useState("");

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["vera_handoff_queue", status, channel],
    queryFn: async () => {
      let q = supabase
        .from("vera_handoff_queue")
        .select("*")
        .order("status", { ascending: true })
        .order("criado_em", { ascending: false })
        .limit(500);
      if (status !== "all") q = q.eq("status", status);
      if (channel !== "all") q = q.eq("channel", channel);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Handoff[];
    },
  });

  // Realtime
  useEffect(() => {
    const ch = supabase
      .channel("handoff-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vera_handoff_queue" },
        () => qc.invalidateQueries({ queryKey: ["vera_handoff_queue"] }),
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const s = search.trim().toLowerCase();
    if (!s) return data;
    return data.filter(
      (h) =>
        h.chat_id?.toLowerCase().includes(s) ||
        h.motivo?.toLowerCase().includes(s) ||
        h.notas?.toLowerCase().includes(s),
    );
  }, [data, search]);

  function toggle(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function fmt(d: string | null) {
    if (!d) return "—";
    try { return format(new Date(d), "dd/MM/yy HH:mm", { locale: ptBR }); } catch { return d; }
  }

  function openAction(id: number, action: "assumir" | "resolver") {
    setNoteText("");
    setNoteDialog({ id, action });
  }

  async function confirmAction() {
    if (!noteDialog || !user) return;
    const { id, action } = noteDialog;
    const patch: Record<string, string | null> = {};
    if (action === "assumir") {
      patch.status = "assumido";
      patch.assumido_em = new Date().toISOString();
      patch.assumido_por = user.id;
    } else {
      patch.status = "resolvido";
      patch.resolvido_em = new Date().toISOString();
    }
    if (noteText.trim()) {
      const existing = filtered.find((h) => h.id === id)?.notas ?? "";
      const stamp = format(new Date(), "dd/MM HH:mm", { locale: ptBR });
      patch.notas = (existing ? existing + "\n" : "") + `[${stamp}] ${noteText.trim()}`;
    }
    const { error } = await supabase.from("vera_handoff_queue").update(patch).eq("id", id);
    if (error) {
      toast.error("Erro: " + error.message);
      return;
    }
    toast.success(action === "assumir" ? "Atendimento assumido" : "Marcado como resolvido");
    setNoteDialog(null);
    refetch();
  }

  const pendingCount = data?.filter((h) => h.status === "pendente").length ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold flex items-center gap-2">
            <HandHelping className="h-6 w-6 text-primary" /> Fila de atendimento humano
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-2">{pendingCount} pendente{pendingCount > 1 ? "s" : ""}</Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">Pedidos de handoff disparados pela Vera quando precisa de humano.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} /> Atualizar
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Canal</Label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {CHANNELS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Buscar</Label>
            <Input placeholder="chat_id, motivo, nota…" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                <TableHead>Criado</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Chat</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Assumido</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Carregando…</TableCell></TableRow>
              )}
              {!isLoading && filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Nenhum pedido encontrado.</TableCell></TableRow>
              )}
              {filtered.map((h) => {
                const isOpen = expanded.has(h.id);
                return (
                  <>
                    <TableRow key={h.id}>
                      <TableCell>
                        <button onClick={() => toggle(h.id)} className="text-muted-foreground">
                          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColor(h.status)}>{h.status}</Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">{fmt(h.criado_em)}</TableCell>
                      <TableCell><Badge variant="outline">{h.channel}</Badge></TableCell>
                      <TableCell className="font-mono text-xs max-w-[160px] truncate">{h.chat_id}</TableCell>
                      <TableCell className="max-w-[280px] truncate text-sm">{h.motivo}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{fmt(h.assumido_em)}</TableCell>
                      <TableCell className="text-right space-x-2 whitespace-nowrap">
                        {h.status === "pendente" && (
                          <Button size="sm" variant="default" onClick={() => openAction(h.id, "assumir")}>
                            <UserCheck className="h-3.5 w-3.5 mr-1" /> Assumir
                          </Button>
                        )}
                        {h.status !== "resolvido" && (
                          <Button size="sm" variant="outline" onClick={() => openAction(h.id, "resolver")}>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Resolver
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                    {isOpen && (
                      <TableRow key={`${h.id}-detail`} className="bg-muted/30 hover:bg-muted/30">
                        <TableCell />
                        <TableCell colSpan={7} className="py-3 space-y-2">
                          {h.notas && (
                            <div>
                              <div className="text-[11px] font-medium text-muted-foreground uppercase mb-1">Notas</div>
                              <div className="text-sm whitespace-pre-wrap">{h.notas}</div>
                            </div>
                          )}
                          {h.payload && (
                            <div>
                              <div className="text-[11px] font-medium text-muted-foreground uppercase mb-1">Payload</div>
                              <pre className="text-[11px] bg-background/60 border rounded p-2 overflow-auto max-h-48">{JSON.stringify(h.payload, null, 2)}</pre>
                            </div>
                          )}
                          <div className="text-[11px] text-muted-foreground">
                            id: {h.id} · resolvido_em: {fmt(h.resolvido_em)}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!noteDialog} onOpenChange={(o) => !o && setNoteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{noteDialog?.action === "assumir" ? "Assumir atendimento" : "Marcar como resolvido"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs">Nota (opcional)</Label>
            <Textarea
              placeholder="Ex: cliente pediu retorno por telefone às 15h"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNoteDialog(null)}>Cancelar</Button>
            <Button onClick={confirmAction}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
