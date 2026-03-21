import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import DataTable, { Column } from "@/components/admin/DataTable";
import FormDialog from "@/components/admin/FormDialog";
import ImageUpload from "@/components/admin/ImageUpload";

type Case = {
  id: string;
  title: string;
  detail: string;
  before_image: string;
  after_image: string;
  display_order: number;
  active: boolean;
};

const columns: Column<Case>[] = [
  { key: "title", label: "Título" },
  { key: "detail", label: "Detalhe" },
  {
    key: "before_image",
    label: "Antes",
    render: (r) => r.before_image ? <img src={r.before_image} alt="Antes" className="h-12 w-auto rounded" /> : "—",
  },
  {
    key: "after_image",
    label: "Depois",
    render: (r) => r.after_image ? <img src={r.after_image} alt="Depois" className="h-12 w-auto rounded" /> : "—",
  },
  { key: "display_order", label: "Ordem" },
  {
    key: "active",
    label: "Ativo",
    render: (r) => (
      <span className={r.active ? "text-green-600 font-medium" : "text-muted-foreground"}>
        {r.active ? "Sim" : "Não"}
      </span>
    ),
  },
];

const empty: Omit<Case, "id"> = { title: "", detail: "", before_image: "", after_image: "", display_order: 0, active: true };

export default function AdminBeforeAfter() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Case | null>(null);
  const [form, setForm] = useState(empty);

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-before-after"],
    queryFn: async () => {
      const { data, error } = await supabase.from("before_after_cases").select("*").order("display_order");
      if (error) throw error;
      return data as Case[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (editing) {
        const { error } = await supabase.from("before_after_cases").update(form).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("before_after_cases").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-before-after"] });
      toast.success(editing ? "Caso atualizado!" : "Caso criado!");
      close();
    },
    onError: () => toast.error("Erro ao salvar"),
  });

  const remove = useMutation({
    mutationFn: async (row: Case) => {
      const { error } = await supabase.from("before_after_cases").delete().eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-before-after"] });
      toast.success("Caso excluído!");
    },
    onError: () => toast.error("Erro ao excluir"),
  });

  const close = () => { setOpen(false); setEditing(null); setForm(empty); };
  const openNew = () => { setForm(empty); setEditing(null); setOpen(true); };
  const openEdit = (row: Case) => {
    setEditing(row);
    setForm({ title: row.title, detail: row.detail, before_image: row.before_image, after_image: row.after_image, display_order: row.display_order, active: row.active });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Antes e Depois</h2>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Novo Caso</Button>
      </div>

      <DataTable data={data} columns={columns} loading={isLoading} onEdit={openEdit} onDelete={(r) => remove.mutate(r)} />

      <FormDialog open={open} onClose={close} title={editing ? "Editar Caso" : "Novo Caso"}>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4">
          <div>
            <Label>Título</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <Label>Detalhe</Label>
            <Input value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} />
          </div>
          <div>
            <Label>Foto Antes</Label>
            <ImageUpload bucket="clinic-images" folder="before-after" value={form.before_image} onChange={(url) => setForm({ ...form, before_image: url })} />
          </div>
          <div>
            <Label>Foto Depois</Label>
            <ImageUpload bucket="clinic-images" folder="before-after" value={form.after_image} onChange={(url) => setForm({ ...form, after_image: url })} />
          </div>
          <div>
            <Label>Ordem de exibição</Label>
            <Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            <Label>Ativo</Label>
          </div>
          <Button type="submit" className="w-full" disabled={save.isPending}>
            {save.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </FormDialog>
    </div>
  );
}
