import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useAgentPresence } from "@/hooks/useAgentPresence";
import { AgentLiveCard } from "@/components/admin/cards/AgentLiveCard";
import type { AgentLiveCardData } from "@/components/admin/cards/AgentLiveCard";
import type { ConversationCardData } from "@/components/admin/cards/ConversationCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ExternalLink, MessageSquare, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

function initials(name: string) {
  const cleaned = (name ?? "").trim();
  if (!cleaned) return "?";
  if (/^\+?\d[\d\s()-]*$/.test(cleaned)) return "#";
  return cleaned.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function parseAiContent(raw: string): string {
  const m = raw.match(/<resposta>([\s\S]*?)<\/resposta>/);
  let text = m ? m[1] : raw;
  text = text.replace(/<proximo_estagio>[\s\S]*?<\/proximo_estagio>/g, "");
  text = text.replace(/\[CONTEXTO_SESSAO\][\s\S]*?(\[\/CONTEXTO_SESSAO\]|$)/g, "");
  return text.trim();
}

function normalizePhone(v: string) {
  return String(v ?? "").replace(/\D/g, "");
}

export default function AdminAoVivo() {
  const { sorted: agentsSorted } = useAgentPresence();
  const [openChat, setOpenChat] = useState<ConversationCardData | null>(null);

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

  // Vera logs (n8n) — fonte oficial de nomes e mensagens
  const { data: veraData } = useQuery({
    queryKey: ["ao-vivo-vera-logs"],
    queryFn: async () => {
      try {
        const { data } = await supabase.functions.invoke("vera-conversation-logs", { body: {} });
        const contatos: any[] = (data as any)?.contatos ?? [];
        const map: Record<string, { nome: string; mensagens: any[] }> = {};
        for (const c of contatos) {
          const phone = normalizePhone(c.session_id ?? "");
          if (!phone) continue;
          map[phone] = { nome: c.nome ?? "", mensagens: c.mensagens ?? [] };
        }
        return map;
      } catch {
        return {} as Record<string, { nome: string; mensagens: any[] }>;
      }
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  // Fallback: pushName via Evolution Contacts
  const phonesNeedingName = useMemo(
    () => leads.filter((l) => !l.name && !l.push_name && !veraData?.[normalizePhone(l.phone)]?.nome).map((l) => l.phone),
    [leads, veraData],
  );

  const { data: pushNameByPhone = {} } = useQuery({
    queryKey: ["ao-vivo-pushnames", phonesNeedingName.length],
    enabled: phonesNeedingName.length > 0,
    queryFn: async () => {
      try {
        const { data } = await supabase.functions.invoke("evo-proxy", {
          body: { action: "findContacts", payload: {} },
        });
        const arr = Array.isArray(data) ? data : (data as any)?.data ?? [];
        const map: Record<string, string> = {};
        for (const c of arr) {
          const jid: string = c?.remoteJid ?? "";
          const phone = jid.replace("@s.whatsapp.net", "");
          if (phone && c?.pushName) map[phone] = c.pushName;
        }
        return map;
      } catch {
        return {} as Record<string, string>;
      }
    },
  });

  function buildCardData(lead: (typeof leads)[0]): ConversationCardData {
    const tags = (lead.lead_tag_assignments ?? []).map((a: any) => a.tag).filter(Boolean);
    const waitMinutes = lead.last_contact_at
      ? Math.floor((Date.now() - new Date(lead.last_contact_at).getTime()) / 60_000)
      : undefined;
    const phoneKey = normalizePhone(lead.phone);
    const veraName = veraData?.[phoneKey]?.nome;
    const fallbackPush = pushNameByPhone[lead.phone];
    return {
      id: lead.id,
      displayName: veraName || lead.push_name || lead.name || fallbackPush || lead.phone,
      phone: lead.phone,
      avatarUrl: lead.profile_pic_url,
      lastMessage: lead.last_message_preview,
      lastContactAt: lead.last_contact_at,
      tags,
      waitMinutes,
      status: lead.status,
    };
  }

  const unassigned = leads.filter((l) => !l.assigned_to);
  const unassignedCard: AgentLiveCardData = {
    agentId: "__unassigned__",
    displayName: "Não atribuído",
    email: "",
    status: "online",
    conversations: unassigned.map(buildCardData),
  };

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

  // Mensagens da conversa (Vera n8n é a fonte oficial)
  const previewMessages = useMemo(() => {
    if (!openChat?.phone) return [] as { id: string; text: string; isOut: boolean; ts: string }[];
    const phoneKey = normalizePhone(openChat.phone);
    const msgs = veraData?.[phoneKey]?.mensagens ?? [];
    return msgs
      .map((m: any, i: number) => {
        const isOut = m.tipo === "ai";
        const text = isOut ? parseAiContent(m.conteudo ?? "") : (m.conteudo ?? "");
        return { id: `${i}`, text, isOut, ts: m.timestamp };
      })
      .filter((m) => m.text);
  }, [openChat?.phone, veraData]);
  const msgsLoading = false;

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
              onConversationClick={(conv) => setOpenChat(conv)}
              className="shrink-0"
            />
          ))}
        </div>
      )}

      <Sheet open={!!openChat} onOpenChange={(o) => !o && setOpenChat(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
          <SheetHeader className="border-b p-4">
            <SheetTitle className="flex items-center gap-3 text-left">
              <Avatar className="h-10 w-10">
                <AvatarImage src={openChat?.avatarUrl ?? undefined} />
                <AvatarFallback>{initials(openChat?.displayName || openChat?.phone || "?")}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold truncate">{openChat?.displayName}</p>
                <p className="text-xs text-muted-foreground font-normal">{openChat?.phone}</p>
              </div>
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1 p-4">
            {msgsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className={cn("h-10", i % 2 ? "ml-auto w-2/3" : "w-3/4")} />
                ))}
              </div>
            ) : previewMessages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 text-sm flex flex-col items-center gap-2">
                <MessageSquare className="h-8 w-8 opacity-40" />
                Sem mensagens registradas.
              </div>
            ) : (
              <div className="space-y-2">
                {previewMessages.map((m: any) => {
                  const isOut = m.direction === "outgoing" || m.sent_by;
                  return (
                    <div key={m.id} className={cn("flex", isOut ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                          isOut ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm",
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.message_text || "[mídia]"}</p>
                        <p className={cn("mt-1 text-[10px]", isOut ? "text-primary-foreground/70" : "text-muted-foreground")}>
                          {m.created_at ? format(new Date(m.created_at), "dd/MM HH:mm", { locale: ptBR }) : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          <div className="border-t p-3">
            <Button asChild className="w-full" variant="default">
              <Link to={`/admin/conversas?tab=whatsapp&chat=${openChat?.phone ?? ""}`}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Abrir conversa completa
              </Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
