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

type Video = Tables<"videos">;
const empty = { id: "", title: "", description: "", youtube_id: "", display_order: 0, active: true, featured: false };

export default function AdminVideos() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<typeof empty | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin_videos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("videos").select("*").order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async (v: typeof empty) => {
      const payload = { title: v.title, description: v.description, youtube_id: v.youtube_id, display_order: v.display_order, active: v.active, featured: v.featured };
      if (v.id) {
        const { error } = await supabase.from("videos").update(payload).eq("id", v.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("videos").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_videos"] }); setEditing(null); toast.success("Salvo!"); },
    onError: () => toast.error("Erro ao salvar"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("videos").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_videos"] }); toast.success("Excluído!"); },
  });

  const columns: Column<Video>[] = [
    { key: "title", label: "Título" },
    { key: "youtube_id", label: "YouTube ID" },
    { key: "display_order", label: "Ordem" },
    { key: "active", label: "Ativo", render: (r) => r.active ? "Sim" : "Não" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold">Vídeos</h2>
        <Button onClick={() => setEditing({ ...empty })}><Plus className="h-4 w-4 mr-2" />Novo</Button>
      </div>
      <DataTable data={data} columns={columns} loading={isLoading} onEdit={(r) => setEditing({ id: r.id, title: r.title, description: r.description, youtube_id: r.youtube_id, display_order: r.display_order, active: r.active, featured: r.featured })} onDelete={(r) => remove.mutate(r.id)} />
      {editing && (
        <FormDialog open={!!editing} onClose={() => setEditing(null)} title={editing.id ? "Editar Vídeo" : "Novo Vídeo"}>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }}>
            <div className="space-y-2"><Label>Título</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Descrição</Label><Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
            <div className="space-y-2"><Label>YouTube ID</Label><Input value={editing.youtube_id} onChange={(e) => setEditing({ ...editing, youtube_id: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Ordem</Label><Input type="number" value={editing.display_order} onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })} /></div>
            <div className="flex items-center gap-2"><Switch checked={editing.featured} onCheckedChange={(v) => setEditing({ ...editing, featured: v })} /><Label>Destaque</Label></div>
            <div className="flex items-center gap-2"><Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} /><Label>Ativo</Label></div>
            <Button type="submit" className="w-full" disabled={save.isPending}>{save.isPending ? "Salvando..." : "Salvar"}</Button>
          </form>
        </FormDialog>
      )}
    </div>
  );
}
