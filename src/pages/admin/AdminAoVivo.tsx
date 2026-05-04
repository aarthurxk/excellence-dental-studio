import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAgentPresence } from "@/hooks/useAgentPresence";
import { AgentLiveCard } from "@/components/admin/cards/AgentLiveCard";
import type { AgentLiveCardData } from "@/components/admin/cards/AgentLiveCard";
import type { ConversationCardData } from "@/components/admin/cards/ConversationCard";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Zap } from "lucide-react";

export default function AdminAoVivo() {
  const navigate = useNavigate();
  const { sorted: agentsSorted } = useAgentPresence();

  // Leads atribuídos com última mensagem e tags
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["ao-vivo-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select(`
          id, phone, name, push_name, profile_pic_url,
          last_contact_at, last_message_preview, status,
          assigned_to,
          lead_tag_assignments(tag:lead_tags(id, name, color))
        `)
        .not("status", "eq", "Perdido")
        .order("last_contact_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 30_000,
  });

  function buildCardData(lead: (typeof leads)[0]): ConversationCardData {
    const tags = (lead.lead_tag_assignments ?? [])
      .map((a: any) => a.tag)
      .filter(Boolean);
    const waitMinutes = lead.last_contact_at
      ? Math.floor((Date.now() - new Date(lead.last_contact_at).getTime()) / 60_000)
      : undefined;
    return {
      id: lead.id,
      displayName: lead.push_name || lead.name || lead.phone,
      phone: lead.phone,
      avatarUrl: lead.profile_pic_url,
      lastMessage: lead.last_message_preview,
      lastContactAt: lead.last_contact_at,
      tags,
      waitMinutes,
      status: lead.status,
    };
  }

  // Unassigned bucket
  const unassigned = leads.filter((l) => !l.assigned_to);
  const unassignedCard: AgentLiveCardData = {
    agentId: "__unassigned__",
    displayName: "Não atribuído",
    email: "",
    status: "online",
    conversations: unassigned.map(buildCardData),
  };

  // Assigned por agente
  const agentCards: AgentLiveCardData[] = agentsSorted.map((agent) => {
    const agentLeads = leads.filter((l) => l.assigned_to === agent.agentId);
    return {
      agentId: agent.agentId,
      displayName: agent.displayName || agent.email,
      email: agent.email,
      avatarUrl: agent.avatarUrl,
      status: agent.status,
      conversations: agentLeads.map(buildCardData),
    };
  });

  const allCards = [unassignedCard, ...agentCards].filter(
    (c) => c.conversations.length > 0 || c.agentId !== "__unassigned__",
  );

  function handleConvClick(conv: ConversationCardData) {
    navigate(`/admin/conversas?tab=whatsapp&phone=${conv.phone}`);
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" /> Ao Vivo
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="w-72 h-[520px] rounded-xl shrink-0" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" /> Ao Vivo
        </h2>
        <span className="text-xs text-muted-foreground">
          {leads.length} atendimento{leads.length !== 1 ? "s" : ""} ativos · atualiza a cada 30s
        </span>
      </div>

      {allCards.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          Nenhum atendimento ativo no momento.
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 items-start">
          {allCards.map((agent) => (
            <AgentLiveCard
              key={agent.agentId}
              agent={agent}
              onConversationClick={handleConvClick}
              className="shrink-0"
            />
          ))}
        </div>
      )}
    </div>
  );
}
