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

type Service = Tables<"services">;

const emptyService = { id: "", title: "", description: "", icon: "Stethoscope", display_order: 0, active: true, benefits: [] as string[] };

export default function AdminServices() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<typeof emptyService | null>(null);
  const [benefitsText, setBenefitsText] = useState("");

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin_services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async (s: typeof emptyService) => {
      const benefits = benefitsText.split("\n").map((b) => b.trim()).filter(Boolean);
      const payload = { title: s.title, description: s.description, icon: s.icon, display_order: s.display_order, active: s.active, benefits };
      if (s.id) {
        const { error } = await supabase.from("services").update(payload).eq("id", s.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("services").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_services"] }); setEditing(null); toast.success("Salvo!"); },
    onError: () => toast.error("Erro ao salvar"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_services"] }); toast.success("Excluído!"); },
  });

  const columns: Column<Service>[] = [
    { key: "title", label: "Título" },
    { key: "icon", label: "Ícone" },
    { key: "display_order", label: "Ordem" },
    { key: "active", label: "Ativo", render: (r) => r.active ? "Sim" : "Não" },
  ];

  const openEdit = (row: Service) => {
    setEditing({ id: row.id, title: row.title, description: row.description, icon: row.icon, display_order: row.display_order, active: row.active, benefits: row.benefits ?? [] });
    setBenefitsText((row.benefits ?? []).join("\n"));
  };

  const openNew = () => { setEditing({ ...emptyService }); setBenefitsText(""); };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold">Tratamentos</h2>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Novo</Button>
      </div>
      <DataTable data={data} columns={columns} loading={isLoading} onEdit={openEdit} onDelete={(r) => remove.mutate(r.id)} />
      {editing && (
        <FormDialog open={!!editing} onClose={() => setEditing(null)} title={editing.id ? "Editar Tratamento" : "Novo Tratamento"}>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }}>
            <div className="space-y-2"><Label>Título</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Descrição</Label><Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
            <div className="space-y-2"><Label>Ícone (Lucide)</Label><Input value={editing.icon} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} /></div>
            <div className="space-y-2"><Label>Benefícios (um por linha)</Label><Textarea value={benefitsText} onChange={(e) => setBenefitsText(e.target.value)} rows={4} /></div>
            <div className="space-y-2"><Label>Ordem</Label><Input type="number" value={editing.display_order} onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })} /></div>
            <div className="flex items-center gap-2"><Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} /><Label>Ativo</Label></div>
            <Button type="submit" className="w-full" disabled={save.isPending}>{save.isPending ? "Salvando..." : "Salvar"}</Button>
          </form>
        </FormDialog>
      )}
    </div>
  );
}
