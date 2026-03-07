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

type Event = Tables<"events">;
const empty = { id: "", title: "", description: "", event_date: new Date().toISOString().split("T")[0], location: "", image_url: "", active: true };

export default function AdminEvents() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<typeof empty | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin_events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").order("event_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async (e: typeof empty) => {
      const payload = { title: e.title, description: e.description, event_date: e.event_date, location: e.location, image_url: e.image_url || null, active: e.active };
      if (e.id) {
        const { error } = await supabase.from("events").update(payload).eq("id", e.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("events").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_events"] }); setEditing(null); toast.success("Salvo!"); },
    onError: () => toast.error("Erro ao salvar"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("events").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_events"] }); toast.success("Excluído!"); },
  });

  const columns: Column<Event>[] = [
    { key: "title", label: "Título" },
    { key: "event_date", label: "Data" },
    { key: "location", label: "Local" },
    { key: "active", label: "Ativo", render: (r) => r.active ? "Sim" : "Não" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold">Eventos</h2>
        <Button onClick={() => setEditing({ ...empty })}><Plus className="h-4 w-4 mr-2" />Novo</Button>
      </div>
      <DataTable data={data} columns={columns} loading={isLoading} onEdit={(r) => setEditing({ id: r.id, title: r.title, description: r.description, event_date: r.event_date, location: r.location, image_url: r.image_url ?? "", active: r.active })} onDelete={(r) => remove.mutate(r.id)} />
      {editing && (
        <FormDialog open={!!editing} onClose={() => setEditing(null)} title={editing.id ? "Editar Evento" : "Novo Evento"}>
          <form className="space-y-4" onSubmit={(ev) => { ev.preventDefault(); save.mutate(editing); }}>
            <div className="space-y-2"><Label>Título</Label><Input value={editing.title} onChange={(ev) => setEditing({ ...editing, title: ev.target.value })} required /></div>
            <div className="space-y-2"><Label>Descrição</Label><Textarea value={editing.description} onChange={(ev) => setEditing({ ...editing, description: ev.target.value })} /></div>
            <div className="space-y-2"><Label>Data</Label><Input type="date" value={editing.event_date} onChange={(ev) => setEditing({ ...editing, event_date: ev.target.value })} required /></div>
            <div className="space-y-2"><Label>Local</Label><Input value={editing.location} onChange={(ev) => setEditing({ ...editing, location: ev.target.value })} /></div>
            <div className="space-y-2"><Label>Imagem</Label><ImageUpload bucket="clinic-images" folder="events" value={editing.image_url} onChange={(url) => setEditing({ ...editing, image_url: url })} /></div>
            <div className="flex items-center gap-2"><Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} /><Label>Ativo</Label></div>
            <Button type="submit" className="w-full" disabled={save.isPending}>{save.isPending ? "Salvando..." : "Salvar"}</Button>
          </form>
        </FormDialog>
      )}
    </div>
  );
}
