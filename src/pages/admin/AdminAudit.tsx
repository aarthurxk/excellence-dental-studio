import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Loader2, Search, RefreshCw, FileJson } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AuditRow {
  id: number;
  user_id: string | null;
  user_email: string | null;
  acao: string;
  tabela: string | null;
  registro_id: string | null;
  dados_antes: any;
  dados_depois: any;
  ip: string | null;
  user_agent: string | null;
  criado_em: string;
}

const ACTION_COLORS: Record<string, string> = {
  insert: "bg-green-500/15 text-green-700 dark:text-green-400",
  update: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  delete: "bg-red-500/15 text-red-700 dark:text-red-400",
  cancel_appointment: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
  reschedule_appointment: "bg-purple-500/15 text-purple-700 dark:text-purple-400",
};

export default function AdminAudit() {
  const [filterAction, setFilterAction] = useState("");
  const [filterTable, setFilterTable] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [selected, setSelected] = useState<AuditRow | null>(null);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["vera_audit_log", filterAction, filterTable, filterEmail],
    queryFn: async () => {
      let q = supabase
        .from("vera_audit_log")
        .select("*")
        .order("criado_em", { ascending: false })
        .limit(500);
      if (filterAction) q = q.ilike("acao", `%${filterAction}%`);
      if (filterTable) q = q.ilike("tabela", `%${filterTable}%`);
      if (filterEmail) q = q.ilike("user_email", `%${filterEmail}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data as AuditRow[];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Auditoria</h1>
          <p className="text-sm text-muted-foreground">
            Histórico de ações sensíveis (últimas 500).
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filtrar por ação"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filtrar por tabela"
              value={filterTable}
              onChange={(e) => setFilterTable(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filtrar por e-mail"
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !data || data.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            Nenhum registro encontrado.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quando</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Tabela</TableHead>
                <TableHead>Registro</TableHead>
                <TableHead className="text-right">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-xs whitespace-nowrap">
                    {format(new Date(row.criado_em), "dd/MM/yy HH:mm:ss", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-xs">
                    {row.user_email ?? <span className="text-muted-foreground">sistema</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={ACTION_COLORS[row.acao] ?? ""}>
                      {row.acao}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{row.tabela ?? "-"}</TableCell>
                  <TableCell className="text-xs font-mono max-w-[200px] truncate">
                    {row.registro_id ?? "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelected(row)}>
                      <FileJson className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detalhe do registro #{selected?.id}</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="space-y-4 mt-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">Quando</div>
                  <div>{format(new Date(selected.criado_em), "dd/MM/yyyy HH:mm:ss")}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Usuário</div>
                  <div>{selected.user_email ?? "sistema"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Ação</div>
                  <div>{selected.acao}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Tabela</div>
                  <div>{selected.tabela ?? "-"}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-muted-foreground">Registro ID</div>
                  <div className="font-mono text-xs break-all">{selected.registro_id ?? "-"}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-muted-foreground">IP / User-Agent</div>
                  <div className="text-xs">{selected.ip ?? "-"}</div>
                  <div className="text-xs text-muted-foreground break-all">{selected.user_agent ?? "-"}</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground mb-1">Dados antes</div>
                <pre className="bg-muted/50 p-3 rounded text-xs overflow-auto max-h-64">
{selected.dados_antes ? JSON.stringify(selected.dados_antes, null, 2) : "—"}
                </pre>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Dados depois</div>
                <pre className="bg-muted/50 p-3 rounded text-xs overflow-auto max-h-64">
{selected.dados_depois ? JSON.stringify(selected.dados_depois, null, 2) : "—"}
                </pre>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
