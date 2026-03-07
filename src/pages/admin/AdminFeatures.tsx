import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import DataTable, { Column } from "@/components/admin/DataTable";
import FormDialog from "@/components/admin/FormDialog";
import type { Tables } from "@/integrations/supabase/types";
import { Plus } from "lucide-react";

type Feature = Tables<"features">;
const empty = { id: "", title: "", description: "", icon: "Star", display_order: 0 };

export default function AdminFeatures() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<typeof empty | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin_features"],
    queryFn: async () => {
      const { data, error } = await supabase.from("features").select("*").order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async (f: typeof empty) => {
      const payload = { title: f.title, description: f.description, icon: f.icon, display_order: f.display_order };
      if (f.id) {
        const { error } = await supabase.from("features").update(payload).eq("id", f.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("features").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_features"] }); setEditing(null); toast.success("Salvo!"); },
    onError: () => toast.error("Erro ao salvar"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("features").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_features"] }); toast.success("Excluído!"); },
  });

  const columns: Column<Feature>[] = [
    { key: "title", label: "Título" },
    { key: "icon", label: "Ícone" },
    { key: "display_order", label: "Ordem" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold">Diferenciais</h2>
        <Button onClick={() => setEditing({ ...empty })}><Plus className="h-4 w-4 mr-2" />Novo</Button>
      </div>
      <DataTable data={data} columns={columns} loading={isLoading} onEdit={(r) => setEditing({ id: r.id, title: r.title, description: r.description, icon: r.icon, display_order: r.display_order })} onDelete={(r) => remove.mutate(r.id)} />
      {editing && (
        <FormDialog open={!!editing} onClose={() => setEditing(null)} title={editing.id ? "Editar Diferencial" : "Novo Diferencial"}>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }}>
            <div className="space-y-2"><Label>Título</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Descrição</Label><Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
            <div className="space-y-2"><Label>Ícone (Lucide)</Label><Input value={editing.icon} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} /></div>
            <div className="space-y-2"><Label>Ordem</Label><Input type="number" value={editing.display_order} onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })} /></div>
            <Button type="submit" className="w-full" disabled={save.isPending}>{save.isPending ? "Salvando..." : "Salvar"}</Button>
          </form>
        </FormDialog>
      )}
    </div>
  );
}
