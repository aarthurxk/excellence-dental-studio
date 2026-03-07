import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";
import { Plus, GripVertical, Pencil, Trash2 } from "lucide-react";
import FormDialog from "@/components/admin/FormDialog";
import { useModulePermission } from "@/hooks/usePermissions";

type RoadmapItem = {
  id: string;
  title: string;
  description: string;
  status: string;
  phase: string;
  display_order: number;
};

const STATUS_LABELS: Record<string, string> = {
  backlog: "Backlog",
  in_progress: "Em Desenvolvimento",
  done: "Concluído",
};

const STATUS_COLORS: Record<string, string> = {
  backlog: "bg-muted text-muted-foreground",
  in_progress: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  done: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
};

export default function AdminRoadmap() {
  const qc = useQueryClient();
  const perm = useModulePermission("roadmap");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RoadmapItem | null>(null);
  const [form, setForm] = useState({ title: "", description: "", status: "backlog", phase: "" });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["roadmap_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roadmap_items")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data as RoadmapItem[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (editing) {
        const { error } = await supabase.from("roadmap_items").update(form).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("roadmap_items").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roadmap_items"] });
      toast.success("Salvo!");
      closeDialog();
    },
    onError: () => toast.error("Erro ao salvar"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("roadmap_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roadmap_items"] });
      toast.success("Removido!");
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("roadmap_items").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roadmap_items"] }),
  });

  function openNew() {
    setEditing(null);
    setForm({ title: "", description: "", status: "backlog", phase: "" });
    setDialogOpen(true);
  }

  function openEdit(item: RoadmapItem) {
    setEditing(item);
    setForm({ title: item.title, description: item.description, status: item.status, phase: item.phase });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditing(null);
  }

  if (isLoading) return <div className="text-muted-foreground">Carregando...</div>;

  const columns = ["backlog", "in_progress", "done"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold">Roadmap</h2>
        {perm.can_edit && (
          <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Novo Item</Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((status) => (
          <div key={status} className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Badge className={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Badge>
              <span className="text-muted-foreground text-xs">
                ({items.filter((i) => i.status === status).length})
              </span>
            </h3>
            <div className="space-y-2">
              {items
                .filter((i) => i.status === status)
                .map((item) => (
                  <Card key={item.id} className="group">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{item.title}</p>
                          {item.phase && (
                            <Badge variant="outline" className="text-[10px] mt-1">{item.phase}</Badge>
                          )}
                        </div>
                        {perm.can_edit && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                            {perm.can_delete && (
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove.mutate(item.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                      )}
                      {perm.can_edit && (
                        <Select value={item.status} onValueChange={(v) => updateStatus.mutate({ id: item.id, status: v })}>
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {columns.map((s) => (
                              <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>

      <FormDialog open={dialogOpen} onClose={closeDialog} title={editing ? "Editar Item" : "Novo Item"}>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
          <div className="space-y-2">
            <Label>Título</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Fase</Label>
            <Input value={form.phase} onChange={(e) => setForm({ ...form, phase: e.target.value })} placeholder="Ex: Fase 1 - MVP" />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {columns.map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={save.isPending}>
            {save.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </FormDialog>
    </div>
  );
}
