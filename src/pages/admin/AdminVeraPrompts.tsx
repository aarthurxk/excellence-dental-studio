import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Brain, History, Pencil, RefreshCw, Save } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

type Prompt = {
  chave: string;
  valor: string;
  descricao: string | null;
  atualizado_em: string | null;
  atualizado_por: string | null;
};

type HistoryRow = {
  id: number;
  chave: string;
  valor_antigo: string | null;
  valor_novo: string;
  alterado_por: string | null;
  alterado_em: string | null;
};

export default function AdminVeraPrompts() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Prompt | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [historyKey, setHistoryKey] = useState<string | null>(null);

  const { data: prompts, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["vera_spin_prompts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vera_spin_prompts")
        .select("*")
        .order("chave", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Prompt[];
    },
  });

  const { data: history, isLoading: loadingHistory } = useQuery({
    queryKey: ["vera_spin_prompts_history", historyKey],
    enabled: !!historyKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vera_spin_prompts_history")
        .select("*")
        .eq("chave", historyKey!)
        .order("alterado_em", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as HistoryRow[];
    },
  });

  const filtered = (prompts ?? []).filter((p) => {
    const s = search.trim().toLowerCase();
    if (!s) return true;
    return (
      p.chave.toLowerCase().includes(s) ||
      p.descricao?.toLowerCase().includes(s) ||
      p.valor.toLowerCase().includes(s)
    );
  });

  function openEdit(p: Prompt) {
    setEditing(p);
    setEditValue(p.valor);
  }

  async function save() {
    if (!editing || !user) return;
    if (editValue === editing.valor) {
      setEditing(null);
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("vera_spin_prompts")
      .update({
        valor: editValue,
        atualizado_por: user.id,
        atualizado_em: new Date().toISOString(),
      })
      .eq("chave", editing.chave);
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
      return;
    }
    toast.success("Prompt atualizado");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["vera_spin_prompts"] });
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
            <Brain className="h-6 w-6 text-primary" /> Prompts da Vera (SPIN)
          </h1>
          <p className="text-sm text-muted-foreground">
            Edite os prompts usados pela IA. Toda alteração é registrada no histórico.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} /> Atualizar
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Buscar</CardTitle>
        </CardHeader>
        <CardContent>
          <Input placeholder="chave, descrição ou conteúdo…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Chave</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="whitespace-nowrap">Atualizado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Carregando…</TableCell></TableRow>
              )}
              {!isLoading && filtered.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum prompt encontrado.</TableCell></TableRow>
              )}
              {filtered.map((p) => (
                <TableRow key={p.chave}>
                  <TableCell className="font-mono text-xs align-top">
                    {p.chave}
                    {p.valor === "PENDENTE_SYNC" && (
                      <Badge variant="outline" className="ml-2 text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">
                        pendente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm align-top max-w-[260px]">
                    {p.descricao || <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-sm align-top max-w-[420px]">
                    <div className="line-clamp-3 whitespace-pre-wrap text-muted-foreground">{p.valor}</div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap align-top">{fmt(p.atualizado_em)}</TableCell>
                  <TableCell className="text-right space-x-2 whitespace-nowrap align-top">
                    <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                      <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setHistoryKey(p.chave)}>
                      <History className="h-3.5 w-3.5 mr-1" /> Histórico
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-mono text-base">{editing?.chave}</DialogTitle>
            {editing?.descricao && (
              <DialogDescription>{editing.descricao}</DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs">Valor</Label>
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              rows={16}
              className="font-mono text-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              Alterações são registradas em histórico automaticamente.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)} disabled={saving}>Cancelar</Button>
            <Button onClick={save} disabled={saving || editValue === editing?.valor}>
              <Save className="h-4 w-4 mr-1" /> {saving ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History sheet */}
      <Sheet open={!!historyKey} onOpenChange={(o) => !o && setHistoryKey(null)}>
        <SheetContent className="sm:max-w-2xl w-full overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-mono text-base">Histórico · {historyKey}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            {loadingHistory && <p className="text-sm text-muted-foreground">Carregando…</p>}
            {!loadingHistory && (history ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">Sem alterações registradas.</p>
            )}
            {(history ?? []).map((h) => (
              <Card key={h.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground font-normal">
                    {fmt(h.alterado_em)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Label className="text-[10px] uppercase text-muted-foreground">Antes</Label>
                    <pre className="text-xs bg-muted/50 border rounded p-2 whitespace-pre-wrap max-h-40 overflow-auto">
                      {h.valor_antigo ?? "(vazio)"}
                    </pre>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase text-muted-foreground">Depois</Label>
                    <pre className="text-xs bg-primary/5 border border-primary/20 rounded p-2 whitespace-pre-wrap max-h-40 overflow-auto">
                      {h.valor_novo}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
