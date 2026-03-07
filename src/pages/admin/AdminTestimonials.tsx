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

type Testimonial = Tables<"testimonials">;
const empty = { id: "", patient_name: "", text: "", rating: 5, active: true, featured: false };

export default function AdminTestimonials() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<typeof empty | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin_testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async (t: typeof empty) => {
      const payload = { patient_name: t.patient_name, text: t.text, rating: t.rating, active: t.active, featured: t.featured };
      if (t.id) {
        const { error } = await supabase.from("testimonials").update(payload).eq("id", t.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("testimonials").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_testimonials"] }); setEditing(null); toast.success("Salvo!"); },
    onError: () => toast.error("Erro ao salvar"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("testimonials").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_testimonials"] }); toast.success("Excluído!"); },
  });

  const columns: Column<Testimonial>[] = [
    { key: "patient_name", label: "Paciente" },
    { key: "rating", label: "Nota", render: (r) => "⭐".repeat(r.rating) },
    { key: "featured", label: "Destaque", render: (r) => r.featured ? "Sim" : "Não" },
    { key: "active", label: "Ativo", render: (r) => r.active ? "Sim" : "Não" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold">Depoimentos</h2>
        <Button onClick={() => setEditing({ ...empty })}><Plus className="h-4 w-4 mr-2" />Novo</Button>
      </div>
      <DataTable data={data} columns={columns} loading={isLoading} onEdit={(r) => setEditing({ id: r.id, patient_name: r.patient_name, text: r.text, rating: r.rating, active: r.active, featured: r.featured })} onDelete={(r) => remove.mutate(r.id)} />
      {editing && (
        <FormDialog open={!!editing} onClose={() => setEditing(null)} title={editing.id ? "Editar Depoimento" : "Novo Depoimento"}>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }}>
            <div className="space-y-2"><Label>Nome do Paciente</Label><Input value={editing.patient_name} onChange={(e) => setEditing({ ...editing, patient_name: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Depoimento</Label><Textarea value={editing.text} onChange={(e) => setEditing({ ...editing, text: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Nota (1-5)</Label><Input type="number" min={1} max={5} value={editing.rating} onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })} /></div>
            <div className="flex items-center gap-2"><Switch checked={editing.featured} onCheckedChange={(v) => setEditing({ ...editing, featured: v })} /><Label>Destaque</Label></div>
            <div className="flex items-center gap-2"><Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} /><Label>Ativo</Label></div>
            <Button type="submit" className="w-full" disabled={save.isPending}>{save.isPending ? "Salvando..." : "Salvar"}</Button>
          </form>
        </FormDialog>
      )}
    </div>
  );
}
