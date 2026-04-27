import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Search, Download, LayoutGrid, TableIcon, Phone, MessageSquare,
  Calendar, User, RefreshCw, GripVertical, X, CalendarClock,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import LeadTagsEditor, { LeadTagChip } from "@/components/admin/LeadTagsEditor";
import { useLeadTagsMap } from "@/hooks/useLeadTags";

const STATUSES = [
  { value: "novo", label: "Novo", color: "bg-blue-500" },
  { value: "qualificado", label: "Qualificado", color: "bg-purple-500" },
  { value: "agendado", label: "Agendado", color: "bg-amber-500" },
  { value: "compareceu", label: "Compareceu", color: "bg-green-500" },
  { value: "nao_compareceu", label: "Não Compareceu", color: "bg-red-500" },
  { value: "perdido", label: "Perdido", color: "bg-muted-foreground" },
] as const;

type LeadStatus = (typeof STATUSES)[number]["value"];

export default function AdminLeads() {
  const qc = useQueryClient();
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState("");
  const [cancelTarget, setCancelTarget] = useState<{ id: string; when: string } | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [rescheduleTarget, setRescheduleTarget] = useState<{ id: string; when: string } | null>(null);
  const [newDateTime, setNewDateTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["crm-leads"],
    queryFn: async () => {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .order("updated_at", { ascending: false });
      return data ?? [];
    },
  });

  // Etiquetas de todos os leads carregados (uma única query)
  const tagsMap = useLeadTagsMap(leads.map((l) => l.id)).data ?? {};

  const lead = useMemo(() => leads.find((l) => l.id === selectedLead), [leads, selectedLead]);

  // Messages for detail
  const { data: leadMessages = [] } = useQuery({
    queryKey: ["lead-msgs", lead?.phone],
    queryFn: async () => {
      if (!lead?.phone) return [];
      const { data } = await supabase
        .from("conversations_log")
        .select("*")
        .eq("lead_phone", lead.phone)
        .order("created_at", { ascending: false })
        .limit(20);
      return data ?? [];
    },
    enabled: !!lead?.phone,
  });

  // Appointments for detail
  const { data: leadAppts = [] } = useQuery({
    queryKey: ["lead-appts", lead?.phone],
    queryFn: async () => {
      if (!lead?.phone) return [];
      const { data } = await supabase
        .from("appointments")
        .select("*")
        .eq("lead_phone", lead.phone)
        .order("scheduled_at", { ascending: false })
        .limit(10);
      return data ?? [];
    },
    enabled: !!lead?.phone,
  });

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch =
        !searchTerm ||
        (l.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.phone.includes(searchTerm) ||
        (l.push_name ?? "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === "all" || l.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [leads, searchTerm, filterStatus]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("leads").update({ status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["crm-leads"] });
    toast.success("Status atualizado");
  };

  const saveNotes = async () => {
    if (!selectedLead) return;
    await supabase.from("leads").update({ notes: editingNotes }).eq("id", selectedLead);
    qc.invalidateQueries({ queryKey: ["crm-leads"] });
    toast.success("Notas salvas");
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setActionLoading(true);
    const { data, error } = await supabase.functions.invoke("cancel-appointment", {
      body: { appointment_id: cancelTarget.id, reason: cancelReason || undefined },
    });
    setActionLoading(false);
    if (error || (data as any)?.error) {
      toast.error("Erro ao cancelar: " + (error?.message || (data as any)?.error));
      return;
    }
    toast.success("Agendamento cancelado");
    if ((data as any)?.gcal && !(data as any).gcal.ok) {
      toast.warning("Banco atualizado, mas Google Calendar falhou");
    }
    setCancelTarget(null);
    setCancelReason("");
    qc.invalidateQueries({ queryKey: ["lead-appts", lead?.phone] });
  };

  const handleReschedule = async () => {
    if (!rescheduleTarget || !newDateTime) return;
    setActionLoading(true);
    const { data, error } = await supabase.functions.invoke("reschedule-appointment", {
      body: {
        appointment_id: rescheduleTarget.id,
        new_scheduled_at: new Date(newDateTime).toISOString(),
        reason: rescheduleReason || undefined,
      },
    });
    setActionLoading(false);
    if (error || (data as any)?.error) {
      toast.error("Erro ao reagendar: " + (error?.message || (data as any)?.error));
      return;
    }
    toast.success("Agendamento remarcado");
    if ((data as any)?.gcal && !(data as any).gcal.ok) {
      toast.warning("Banco atualizado, mas Google Calendar falhou");
    }
    setRescheduleTarget(null);
    setNewDateTime("");
    setRescheduleReason("");
    qc.invalidateQueries({ queryKey: ["lead-appts", lead?.phone] });
  };

  const exportCSV = () => {
    const rows = [
      ["Telefone", "Nome", "Push Name", "Status", "IA", "Msgs In", "Msgs Out", "Primeiro Contato", "Último Contato", "UTM Source", "Notas"],
      ...filtered.map((l) => [
        l.phone, l.name ?? "", l.push_name ?? "", l.status ?? "", l.ai_enabled ? "Sim" : "Não",
        String(l.total_messages_in ?? 0), String(l.total_messages_out ?? 0),
        l.first_contact_at ?? "", l.last_contact_at ?? "", l.utm_source ?? "", (l.notes ?? "").replace(/\n/g, " "),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusInfo = (s: string) => STATUSES.find((st) => st.value === s) ?? STATUSES[0];

  const openDetail = (id: string) => {
    setSelectedLead(id);
    const l = leads.find((x) => x.id === id);
    setEditingNotes(l?.notes ?? "");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-2xl font-display font-bold">CRM Leads</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={view === "kanban" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("kanban")}
          >
            <LayoutGrid className="h-4 w-4 mr-1" /> Kanban
          </Button>
          <Button
            variant={view === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("table")}
          >
            <TableIcon className="h-4 w-4 mr-1" /> Tabela
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button variant="ghost" size="icon" onClick={() => qc.invalidateQueries({ queryKey: ["crm-leads"] })}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Kanban View */}
      {view === "kanban" && (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {STATUSES.map((col) => {
            const colLeads = filtered.filter((l) => l.status === col.value);
            return (
              <div key={col.value} className="min-w-[260px] w-[260px] shrink-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("h-3 w-3 rounded-full", col.color)} />
                  <span className="font-semibold text-sm">{col.label}</span>
                  <Badge variant="secondary" className="text-xs ml-auto">{colLeads.length}</Badge>
                </div>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {colLeads.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">Nenhum lead</p>
                  )}
                  {colLeads.map((l) => (
                    <Card
                      key={l.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => openDetail(l.id)}
                    >
                      <CardContent className="p-3 space-y-1">
                        <p className="font-medium text-sm truncate">{l.name || l.push_name || l.phone}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {l.phone}
                        </p>
                        {(tagsMap[l.id]?.length ?? 0) > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {tagsMap[l.id].map((t) => (
                              <LeadTagChip key={t.id} tag={t} size="sm" />
                            ))}
                          </div>
                        )}
                        {l.last_message_preview && (
                          <p className="text-xs text-muted-foreground truncate italic">
                            "{l.last_message_preview}"
                          </p>
                        )}
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                          <span>{l.total_messages_in ?? 0} in / {l.total_messages_out ?? 0} out</span>
                          {l.last_contact_at && (
                            <span>{formatDistanceToNow(new Date(l.last_contact_at), { addSuffix: true, locale: ptBR })}</span>
                          )}
                        </div>
                      </CardContent>

                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {view === "table" && (
        <div className="rounded-md border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Etiquetas</TableHead>
                <TableHead>IA</TableHead>
                <TableHead>Msgs</TableHead>
                <TableHead>Último Contato</TableHead>
                <TableHead>Origem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center">Carregando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">Nenhum lead</TableCell></TableRow>
              ) : (
                filtered.map((l) => {
                  const si = statusInfo(l.status ?? "novo");
                  const leadTags = tagsMap[l.id] ?? [];
                  return (
                    <TableRow key={l.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openDetail(l.id)}>
                      <TableCell className="font-medium">{l.name || l.push_name || "—"}</TableCell>
                      <TableCell>{l.phone}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs gap-1">
                          <span className={cn("h-2 w-2 rounded-full", si.color)} />
                          {si.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {leadTags.length === 0 ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : (
                            leadTags.map((t) => <LeadTagChip key={t.id} tag={t} size="sm" />)
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{l.ai_enabled ? "🤖" : "👤"}</TableCell>
                      <TableCell>{(l.total_messages_in ?? 0) + (l.total_messages_out ?? 0)}</TableCell>
                      <TableCell>
                        {l.last_contact_at
                          ? formatDistanceToNow(new Date(l.last_contact_at), { addSuffix: true, locale: ptBR })
                          : "—"}
                      </TableCell>
                      <TableCell className="text-xs">{l.utm_source || "direto"}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>

          </Table>
        </div>
      )}

      {/* Lead Detail Sheet */}
      <Sheet open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {lead && (
            <>
              <SheetHeader>
                <SheetTitle>{lead.name || lead.push_name || lead.phone}</SheetTitle>
              </SheetHeader>
              <div className="space-y-5 mt-4">
                {/* Info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Telefone</p>
                    <p className="font-medium">{lead.phone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Push Name</p>
                    <p className="font-medium">{lead.push_name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Primeiro Contato</p>
                    <p className="font-medium">
                      {lead.first_contact_at ? format(new Date(lead.first_contact_at), "dd/MM/yy HH:mm") : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Último Contato</p>
                    <p className="font-medium">
                      {lead.last_contact_at ? format(new Date(lead.last_contact_at), "dd/MM/yy HH:mm") : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">UTM</p>
                    <p className="font-medium text-xs">{[lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(" / ") || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">IA</p>
                    <p className="font-medium">{lead.ai_enabled ? "🤖 Ativa" : "👤 Humano"}</p>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Status</p>
                  <Select value={lead.status ?? "novo"} onValueChange={(v) => updateStatus(lead.id, v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Etiquetas */}
                <div>
                  <p className="text-muted-foreground text-xs mb-2">Etiquetas</p>
                  <LeadTagsEditor leadId={lead.id} size="md" />
                </div>

                {/* Notes */}
                <div>

                  <p className="text-muted-foreground text-xs mb-1">Notas Internas</p>
                  <Textarea
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    rows={3}
                  />
                  <Button size="sm" className="mt-2" onClick={saveNotes}>Salvar Notas</Button>
                </div>

                {/* Appointments */}
                {leadAppts.length > 0 && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-2 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Agendamentos
                    </p>
                    <div className="space-y-2">
                      {leadAppts.map((a) => {
                        const when = format(new Date(a.scheduled_at), "dd/MM/yy HH:mm");
                        const canAct = a.status !== "cancelled" && a.status !== "completed";
                        return (
                          <div key={a.id} className="text-sm border rounded-md p-2 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{when}</span>
                              <Badge variant="outline" className="text-xs">{a.status}</Badge>
                            </div>
                            {a.procedure_interest && (
                              <p className="text-xs text-muted-foreground">{a.procedure_interest}</p>
                            )}
                            {canAct && (
                              <div className="flex gap-1 pt-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  onClick={() => {
                                    setRescheduleTarget({ id: a.id, when });
                                    setNewDateTime(format(new Date(a.scheduled_at), "yyyy-MM-dd'T'HH:mm"));
                                  }}
                                >
                                  <CalendarClock className="h-3 w-3 mr-1" /> Reagendar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs text-destructive hover:text-destructive"
                                  onClick={() => setCancelTarget({ id: a.id, when })}
                                >
                                  <X className="h-3 w-3 mr-1" /> Cancelar
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}


                {/* Recent messages */}
                <div>
                  <p className="text-muted-foreground text-xs mb-2 flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" /> Últimas Mensagens
                  </p>
                  <div className="space-y-1 max-h-[200px] overflow-y-auto">
                    {leadMessages.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Nenhuma mensagem registrada</p>
                    ) : (
                      leadMessages.map((m) => (
                        <div key={m.id} className="text-xs border-b pb-1">
                          <div className="flex items-center gap-1">
                            <Badge variant={m.direction === "incoming" ? "secondary" : "default"} className="text-[10px]">
                              {m.sent_by === "ai" ? "🤖" : m.sent_by === "human" ? "👤" : "📩"}
                            </Badge>
                            <span className="text-muted-foreground">
                              {m.created_at ? format(new Date(m.created_at), "dd/MM HH:mm") : ""}
                            </span>
                          </div>
                          <p className="truncate mt-0.5">{m.message_text || "[mídia]"}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Cancel Dialog */}
      <Dialog open={!!cancelTarget} onOpenChange={(o) => !o && (setCancelTarget(null), setCancelReason(""))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar agendamento</DialogTitle>
            <DialogDescription>
              {cancelTarget?.when} — esta ação cancela no Google Calendar e notifica o paciente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Motivo (opcional)</Label>
            <Textarea
              id="cancel-reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Ex: paciente solicitou cancelamento"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)} disabled={actionLoading}>
              Voltar
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={actionLoading}>
              {actionLoading ? "Cancelando..." : "Confirmar cancelamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={!!rescheduleTarget} onOpenChange={(o) => !o && (setRescheduleTarget(null), setNewDateTime(""), setRescheduleReason(""))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reagendar</DialogTitle>
            <DialogDescription>
              Atual: {rescheduleTarget?.when}. O Google Calendar será atualizado automaticamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="new-dt">Nova data e horário</Label>
              <Input
                id="new-dt"
                type="datetime-local"
                value={newDateTime}
                onChange={(e) => setNewDateTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resch-reason">Motivo (opcional)</Label>
              <Textarea
                id="resch-reason"
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleTarget(null)} disabled={actionLoading}>
              Voltar
            </Button>
            <Button onClick={handleReschedule} disabled={actionLoading || !newDateTime}>
              {actionLoading ? "Salvando..." : "Confirmar reagendamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
