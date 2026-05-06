import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ConversationCard } from "@/components/admin/cards/ConversationCard";
import type { ConversationCardData } from "@/components/admin/cards/ConversationCard";
import { TagFilter } from "@/components/admin/filters/TagFilter";
import { useTags } from "@/hooks/useLeadTags";
import { useConversationFilters } from "@/hooks/useConversationFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolveContactName } from "@/lib/contactName";

export default function AdminPendentes() {
  const navigate = useNavigate();
  const { data: allTags = [] } = useTags();
  const { filters, setFilter, clearFilters, hasActiveFilters, applyLocal } = useConversationFilters();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["pendentes-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select(`
          id, phone, name, push_name, profile_pic_url,
          last_contact_at, last_message_preview, status,
          total_messages_in,
          lead_tag_assignments(tag:lead_tags(id, name, color))
        `)
        .in("status", ["Novo", "novo"])
        .is("assigned_to", null)
        .order("last_contact_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      const rows = data ?? [];
      const phones = rows.map((lead) => lead.phone).filter(Boolean);
      const { data: logs } = phones.length
        ? await supabase
            .from("conversations_log")
            .select("lead_phone, message_text")
            .in("lead_phone", phones)
            .order("created_at", { ascending: false })
            .limit(600)
        : { data: [] };

      const hintsByPhone = new Map<string, string[]>();
      for (const log of logs ?? []) {
        const phone = log.lead_phone;
        if (!phone) continue;
        const hints = hintsByPhone.get(phone) ?? [];
        if (log.message_text) hints.push(log.message_text);
        hintsByPhone.set(phone, hints);
      }

      return rows.map((lead) => {
        const tags = (lead.lead_tag_assignments ?? []).map((a: any) => a.tag).filter(Boolean);
        const waitMinutes = lead.last_contact_at
          ? Math.floor((Date.now() - new Date(lead.last_contact_at).getTime()) / 60_000)
          : undefined;
        return {
          id: lead.id,
          displayName: resolveContactName({
            leadName: lead.name,
            leadPushName: lead.push_name,
            phone: lead.phone,
            lastMessage: lead.last_message_preview ?? hintsByPhone.get(lead.phone)?.[0],
          }),
          phone: lead.phone,
          avatarUrl: lead.profile_pic_url,
          lastMessage: lead.last_message_preview,
          lastContactAt: lead.last_contact_at,
          tags,
          waitMinutes,
          status: lead.status,
          unreadCount: lead.total_messages_in ?? 0,
        } as ConversationCardData & { status: string };
      });
    },
    refetchInterval: 60_000,
  });

  // Contagem de tags nos resultados
  const tagCounts: Record<string, number> = {};
  for (const lead of leads) {
    for (const tag of lead.tags ?? []) {
      tagCounts[tag.id] = (tagCounts[tag.id] ?? 0) + 1;
    }
  }

  const filtered = applyLocal(
    leads.map((l) => ({ ...l, displayName: l.displayName, phone: l.phone })),
  );

  function handleClick(conv: ConversationCardData) {
    navigate(`/admin/conversas?tab=whatsapp&phone=${conv.phone}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" /> Pendentes
        </h2>
        <span className="text-xs text-muted-foreground">
          {filtered.length} de {leads.length} contatos
        </span>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        <TagFilter
          tags={allTags}
          selected={filters.tagIds}
          onChange={(ids) => setFilter("tagIds", ids)}
          counts={tagCounts}
        />
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs">
            <SlidersHorizontal className="h-3.5 w-3.5 mr-1" /> Limpar filtros
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          {hasActiveFilters ? "Nenhum resultado para os filtros selecionados." : "Nenhum pendente no momento."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((lead) => (
            <ConversationCard
              key={lead.id}
              data={lead}
              onClick={() => handleClick(lead)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
