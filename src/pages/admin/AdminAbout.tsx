import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import type { Tables } from "@/integrations/supabase/types";

type About = Tables<"about_content">;

export default function AdminAbout() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin_about"],
    queryFn: async () => {
      const { data, error } = await supabase.from("about_content").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState({ title: "", paragraph_1: "", paragraph_2: "", paragraph_3: "", stat_years: "", stat_patients: "", stat_treatments: "" });

  useEffect(() => {
    if (data) setForm({
      title: data.title, paragraph_1: data.paragraph_1,
      paragraph_2: data.paragraph_2 ?? "", paragraph_3: data.paragraph_3 ?? "",
      stat_years: data.stat_years ?? "", stat_patients: data.stat_patients ?? "", stat_treatments: data.stat_treatments ?? "",
    });
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      if (data?.id) {
        const { error } = await supabase.from("about_content").update(form).eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("about_content").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_about"] }); toast.success("Salvo!"); },
    onError: () => toast.error("Erro ao salvar"),
  });

  if (isLoading) return <div className="text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-display font-bold">Sobre a Clínica</h2>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
        <div className="space-y-2"><Label>Título</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div className="space-y-2"><Label>Parágrafo 1</Label><Textarea value={form.paragraph_1} onChange={(e) => setForm({ ...form, paragraph_1: e.target.value })} rows={4} /></div>
        <div className="space-y-2"><Label>Parágrafo 2</Label><Textarea value={form.paragraph_2} onChange={(e) => setForm({ ...form, paragraph_2: e.target.value })} rows={4} /></div>
        <div className="space-y-2"><Label>Parágrafo 3</Label><Textarea value={form.paragraph_3} onChange={(e) => setForm({ ...form, paragraph_3: e.target.value })} rows={4} /></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2"><Label>Anos</Label><Input value={form.stat_years} onChange={(e) => setForm({ ...form, stat_years: e.target.value })} /></div>
          <div className="space-y-2"><Label>Pacientes</Label><Input value={form.stat_patients} onChange={(e) => setForm({ ...form, stat_patients: e.target.value })} /></div>
          <div className="space-y-2"><Label>Tratamentos</Label><Input value={form.stat_treatments} onChange={(e) => setForm({ ...form, stat_treatments: e.target.value })} /></div>
        </div>
        <Button type="submit" disabled={save.isPending}>{save.isPending ? "Salvando..." : "Salvar"}</Button>
      </form>
    </div>
  );
}
