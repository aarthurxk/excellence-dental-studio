import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DataTable, { Column } from "@/components/admin/DataTable";
import type { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Msg = Tables<"contact_messages">;

export default function AdminMessages() {
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin_messages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const toggleRead = useMutation({
    mutationFn: async (msg: Msg) => {
      const { error } = await supabase.from("contact_messages").update({ read: !msg.read }).eq("id", msg.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin_messages"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_messages"] }); toast.success("Excluído!"); },
  });

  const columns: Column<Msg>[] = [
    { key: "name", label: "Nome" },
    { key: "email", label: "E-mail" },
    { key: "phone", label: "Telefone" },
    { key: "message", label: "Mensagem", render: (r) => <span className="line-clamp-2 max-w-xs">{r.message}</span> },
    { key: "read", label: "Status", render: (r) => (
      <Badge variant={r.read ? "secondary" : "default"} className="cursor-pointer" onClick={() => toggleRead.mutate(r)}>
        {r.read ? "Lida" : "Nova"}
      </Badge>
    )},
    { key: "created_at", label: "Data", render: (r) => format(new Date(r.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }) },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-display font-bold">Mensagens de Contato</h2>
      <DataTable data={data} columns={columns} loading={isLoading} onDelete={(r) => remove.mutate(r.id)} />
    </div>
  );
}
