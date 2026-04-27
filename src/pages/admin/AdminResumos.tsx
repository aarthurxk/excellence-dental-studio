import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronRight, FileBarChart, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Resumo = {
  id: number;
  user_id: string;
  channel: string;
  outcome: string | null;
  data_agendamento: string | null;
  tags: string[] | null;
  resumo: string;
  origem: string | null;
  criado_em: string | null;
};

const OUTCOMES = ["agendado", "qualificado", "interessado", "nao_qualificado", "perdido", "duvida", "outro"];
const CHANNELS = ["whatsapp", "site", "instagram", "outro"];

function outcomeColor(o: string | null) {
  switch (o) {
    case "agendado": return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
    case "qualificado": return "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30";
    case "interessado": return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
    case "nao_qualificado":
    case "perdido": return "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30";
    default: return "bg-muted text-muted-foreground border-border";
  }
}

export default function AdminResumos() {
  const [outcome, setOutcome] = useState<string>("all");
  const [channel, setChannel] = useState<string>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["vera_resumos", outcome, channel, from, to],
    queryFn: async () => {
      let q = supabase
        .from("vera_resumos")
        .select("*")
        .order("criado_em", { ascending: false })
        .limit(500);

      if (outcome !== "all") q = q.eq("outcome", outcome);
      if (channel !== "all") q = q.eq("channel", channel);
      if (from) q = q.gte("criado_em", new Date(from).toISOString());
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        q = q.lte("criado_em", end.toISOString());
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Resumo[];
    },
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const s = search.trim().toLowerCase();
    if (!s) return data;
    return data.filter(
      (r) =>
        r.user_id?.toLowerCase().includes(s) ||
        r.resumo?.toLowerCase().includes(s) ||
        (r.tags ?? []).some((t) => t.toLowerCase().includes(s)),
    );
  }, [data, search]);

  function toggle(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function fmt(d: string | null) {
    if (!d) return "—";
    try { return format(new Date(d), "dd/MM/yy HH:mm", { locale: ptBR }); } catch { return d; }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold flex items-center gap-2">
            <FileBarChart className="h-6 w-6 text-primary" /> Resumos de conversas
          </h1>
          <p className="text-sm text-muted-foreground">Encerramentos enviados pela Vera (n8n) com outcome e tags.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Outcome</Label>
            <Select value={outcome} onValueChange={setOutcome}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {OUTCOMES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
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
            <Label className="text-xs">De</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Até</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Buscar</Label>
            <Input placeholder="user, texto, tag…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Data</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Agendamento</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Resumo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Carregando…</TableCell></TableRow>
              )}
              {!isLoading && filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Nenhum resumo encontrado.</TableCell></TableRow>
              )}
              {filtered.map((r) => {
                const isOpen = expanded.has(r.id);
                return (
                  <>
                    <TableRow key={r.id} className="cursor-pointer" onClick={() => toggle(r.id)}>
                      <TableCell>
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">{fmt(r.criado_em)}</TableCell>
                      <TableCell><Badge variant="outline">{r.channel}</Badge></TableCell>
                      <TableCell className="font-mono text-xs max-w-[180px] truncate">{r.user_id}</TableCell>
                      <TableCell>
                        {r.outcome ? (
                          <Badge variant="outline" className={outcomeColor(r.outcome)}>{r.outcome}</Badge>
                        ) : <span className="text-muted-foreground text-xs">—</span>}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">{fmt(r.data_agendamento)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {(r.tags ?? []).slice(0, 3).map((t) => (
                            <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                          ))}
                          {(r.tags?.length ?? 0) > 3 && (
                            <span className="text-[10px] text-muted-foreground">+{(r.tags!.length - 3)}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[360px] truncate text-sm text-muted-foreground">
                        {r.resumo}
                      </TableCell>
                    </TableRow>
                    {isOpen && (
                      <TableRow key={`${r.id}-detail`} className="bg-muted/30 hover:bg-muted/30">
                        <TableCell />
                        <TableCell colSpan={7} className="py-3">
                          <div className="text-sm whitespace-pre-wrap">{r.resumo}</div>
                          <div className="text-[11px] text-muted-foreground mt-2">
                            origem: {r.origem ?? "—"} · id: {r.id}
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
    </div>
  );
}
