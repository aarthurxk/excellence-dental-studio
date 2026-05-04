import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DeletedMessageRecord {
  id: string;
  source_table: string;
  source_id: string;
  author: string | null;
  author_phone: string | null;
  content: string;
  sent_at: string;
  deleted_at: string;
  deleted_by: string | null;
  deletion_reason: string | null;
  metadata: Record<string, unknown> | null;
}

const ALLOWED_ROLES = new Set(["admin", "socio", "gerente"]);

/**
 * Busca mensagens apagadas do audit log.
 * Apenas retorna dados para admin/sócio/gerente.
 * A tabela `deleted_message_audit` será criada na Etapa 1 (migration).
 */
export function useDeletedMessages(options?: { sourceId?: string; limit?: number }) {
  const { role } = useAuth();
  const canView = !!role && ALLOWED_ROLES.has(role);

  return useQuery({
    queryKey: ["deleted-messages", options?.sourceId, options?.limit],
    queryFn: async (): Promise<DeletedMessageRecord[]> => {
      let query = (supabase as any)
        .from("deleted_message_audit")
        .select("*")
        .order("deleted_at", { ascending: false })
        .limit(options?.limit ?? 100);

      if (options?.sourceId) {
        query = query.eq("source_id", options.sourceId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: canView,
    staleTime: 30_000,
  });
}

/**
 * Hook simples que indica se uma mensagem (por ID) foi apagada,
 * buscando do cache React Query sem nova network call.
 */
export function useIsMessageDeleted(messageId: string | undefined) {
  const { data = [] } = useDeletedMessages({ limit: 500 });
  if (!messageId) return false;
  return data.some((r) => r.source_id === messageId);
}
