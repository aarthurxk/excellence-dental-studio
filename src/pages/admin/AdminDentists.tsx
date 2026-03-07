import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import DataTable, { Column } from "@/components/admin/DataTable";
import FormDialog from "@/components/admin/FormDialog";
import type { Tables } from "@/integrations/supabase/types";
import { Plus } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

type Dentist = Tables<"dentists">;
const empty = { id: "", name: "", specialty: "", cro: "", bio: "", photo_url: "", display_order: 0, active: true };

export default function AdminDentists() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<typeof empty | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin_dentists"],
    queryFn: async () => {
      const { data, error } = await supabase.from("dentists").select("*").order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async (d: typeof empty) => {
      const payload = { name: d.name, specialty: d.specialty, cro: d.cro, bio: d.bio, photo_url: d.photo_url || null, display_order: d.display_order, active: d.active };
      if (d.id) {
        const { error } = await supabase.from("dentists").update(payload).eq("id", d.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("dentists").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_dentists"] }); setEditing(null); toast.success("Salvo!"); },
    onError: () => toast.error("Erro ao salvar"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("dentists").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_dentists"] }); toast.success("Excluído!"); },
  });

  const columns: Column<Dentist>[] = [
    { key: "name", label: "Nome" },
    { key: "specialty", label: "Especialidade" },
    { key: "cro", label: "CRO" },
    { key: "active", label: "Ativo", render: (r) => r.active ? "Sim" : "Não" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold">Dentistas</h2>
        <Button onClick={() => setEditing({ ...empty })}><Plus className="h-4 w-4 mr-2" />Novo</Button>
      </div>
      <DataTable data={data} columns={columns} loading={isLoading} onEdit={(r) => setEditing({ id: r.id, name: r.name, specialty: r.specialty, cro: r.cro, bio: r.bio, photo_url: r.photo_url ?? "", display_order: r.display_order, active: r.active })} onDelete={(r) => remove.mutate(r.id)} />
      {editing && (
        <FormDialog open={!!editing} onClose={() => setEditing(null)} title={editing.id ? "Editar Dentista" : "Novo Dentista"}>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }}>
            <div className="space-y-2"><Label>Nome</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Especialidade</Label><Input value={editing.specialty} onChange={(e) => setEditing({ ...editing, specialty: e.target.value })} /></div>
            <div className="space-y-2"><Label>CRO</Label><Input value={editing.cro} onChange={(e) => setEditing({ ...editing, cro: e.target.value })} /></div>
            <div className="space-y-2"><Label>Bio</Label><Textarea value={editing.bio} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} /></div>
            <div className="space-y-2"><Label>URL da Foto</Label><Input value={editing.photo_url} onChange={(e) => setEditing({ ...editing, photo_url: e.target.value })} /></div>
            <div className="space-y-2"><Label>Ordem</Label><Input type="number" value={editing.display_order} onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })} /></div>
            <div className="flex items-center gap-2"><Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} /><Label>Ativo</Label></div>
            <Button type="submit" className="w-full" disabled={save.isPending}>{save.isPending ? "Salvando..." : "Salvar"}</Button>
          </form>
        </FormDialog>
      )}
    </div>
  );
}
