import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DataTable, { Column } from "@/components/admin/DataTable";
import { DeletedMessageBadge } from "@/components/admin/badges/DeletedMessageBadge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2 } from "lucide-react";

// Estende o tipo base com campos de soft delete (adicionados na migration Etapa 1)
interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  read: boolean;
  created_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
  deletion_reason: string | null;
}

export default function AdminMessages() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const allPerms = usePermissions() as Record<string, { can_view: boolean }>;
  const canViewAudit = allPerms["messages_audit"]?.can_view === true;

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin_messages"],
    queryFn: async () => {
      // Admin/supervisor vê tudo (incluindo soft-deletadas via audit flag)
      // Usuários normais veem apenas não-deletadas
      const query = supabase
        .from("contact_messages")
        .select("id, name, email, phone, message, read, created_at, deleted_at, deleted_by, deletion_reason")
        .order("created_at", { ascending: false });

      if (!canViewAudit) {
        query.is("deleted_at", null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as ContactMessage[];
    },
  });

  const toggleRead = useMutation({
    mutationFn: async (msg: ContactMessage) => {
      const { error } = await supabase
        .from("contact_messages")
        .update({ read: !msg.read })
        .eq("id", msg.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin_messages"] }),
  });

  // Soft delete: marca deleted_at em vez de apagar do banco
  const softDelete = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("contact_messages")
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: user?.id ?? null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_messages"] });
      toast.success("Mensagem removida do painel.");
    },
    onError: (e: Error) => toast.error("Erro: " + e.message),
  });

  const columns: Column<ContactMessage>[] = [
    { key: "name", label: "Nome" },
    { key: "email", label: "E-mail" },
    { key: "phone", label: "Telefone" },
    {
      key: "message",
      label: "Mensagem",
      render: (r) => {
        if (r.deleted_at && canViewAudit) {
          return (
            <DeletedMessageBadge
              originalContent={r.message}
              info={{
                deletedAt: r.deleted_at,
                deletedBy: r.deleted_by ?? undefined,
              }}
              canViewContent={canViewAudit}
            />
          );
        }
        return <span className="line-clamp-2 max-w-xs">{r.message}</span>;
      },
    },
    {
      key: "read",
      label: "Status",
      render: (r) => {
        if (r.deleted_at) {
          return (
            <Badge variant="outline" className="text-muted-foreground gap-1">
              <Trash2 className="h-3 w-3" /> Removida
            </Badge>
          );
        }
        return (
          <Badge
            variant={r.read ? "secondary" : "default"}
            className="cursor-pointer"
            onClick={() => toggleRead.mutate(r)}
          >
            {r.read ? "Lida" : "Nova"}
          </Badge>
        );
      },
    },
    {
      key: "created_at",
      label: "Data",
      render: (r) =>
        format(new Date(r.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold">Mensagens de Contato</h2>
        {canViewAudit && (
          <Badge variant="outline" className="text-xs text-muted-foreground">
            Modo auditoria — exibindo removidas
          </Badge>
        )}
      </div>
      <DataTable
        data={data}
        columns={columns}
        loading={isLoading}
        onDelete={(r) => {
          if (r.deleted_at) return; // já apagada
          softDelete.mutate(r.id);
        }}
      />
    </div>
  );
}
