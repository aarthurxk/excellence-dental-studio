import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { evoProxy } from "@/hooks/useEvoProxy";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Send,
  RefreshCw,
  ArrowLeft,
  Bot,
  User,
  Mic,
  Loader2,
  EyeOff,
  Eye,
  ListChecks,
  ShieldCheck,
  RotateCcw,
  XCircle,
  Trash2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import LeadTagsEditor from "@/components/admin/LeadTagsEditor";
import { normalizeWhatsappPhone, whatsappRemoteJidFromVeraChatId } from "@/lib/veraActions";
import { resolveContactName } from "@/lib/contactName";
import { DeletedMessageBadge } from "@/components/admin/badges/DeletedMessageBadge";
import { usePermissions } from "@/hooks/usePermissions";
import { TagFilter } from "@/components/admin/filters/TagFilter";
import { useTags, useLeadTagsMap } from "@/hooks/useLeadTags";

interface EvoChat { remoteJid: string; name: string | null; unreadMessages: number; }
interface EvoContact { remoteJid: string; pushName: string | null; profilePicUrl: string | null; }
interface EvoMessageRecord { key: { id: string; fromMe: boolean; remoteJid: string }; pushName: string | null; messageType: string; message: Record<string, string>; messageTimestamp: number; }
interface ChatItem { remoteJid: string; name: string; profilePic: string | null; unread: number; lastMessage?: string; lastTimestamp?: number; }
interface VeraContatoResumo { session_id: string; nome: string; }

interface ConvLogMeta {
  id: string;
  whatsapp_message_id: string | null;
  is_audio: boolean | null;
  audio_pending: boolean | null;
  hidden_from_ai: boolean | null;
  message_text: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  deletion_reason: string | null;
}

interface VeraLeadAction {
  id: number;
  chat_id: string;
  channel: string | null;
  action_type: string;
  reason: string | null;
  score: number | null;
  prioridade: string | null;
  temperatura: string | null;
  ultimo_interesse: string | null;
  sinais: string[] | null;
  status: string;
  scheduled_for: string | null;
  response_text: string | null;
  executor_note: string | null;
  patient_replied_after_action?: boolean;
}

interface VeraActionsResponse {
  ok: boolean;
  actions?: VeraLeadAction[];
  updated?: VeraLeadAction[];
  items?: Array<{ decision: string; note: string; followup_text: string }>;
  error?: string;
}

const SPIN_LABELS: Record<string, string> = {
  triagem: "Triagem",
  situacao: "Situação",
  problema: "Problema",
  implicacao: "Implicação",
  necessidade: "Necessidade",
  proposta: "Proposta",
  encerramento: "Encerramento",
};

const SPIN_COLORS: Record<string, string> = {
  triagem: "bg-slate-500/15 text-slate-700 border-slate-500/30",
  situacao: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  problema: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  implicacao: "bg-orange-500/15 text-orange-700 border-orange-500/30",
  necessidade: "bg-violet-500/15 text-violet-700 border-violet-500/30",
  proposta: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  encerramento: "bg-green-600/15 text-green-700 border-green-600/30",
};

function actionStatusColor(status: string) {
  switch (status) {
    case "pending": return "bg-amber-500/15 text-amber-700 border-amber-500/30";
    case "ignored": return "bg-slate-500/15 text-slate-700 border-slate-500/30";
    case "simulated": return "bg-blue-500/15 text-blue-700 border-blue-500/30";
    case "sent": return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30";
    case "failed": return "bg-rose-500/15 text-rose-700 border-rose-500/30";
    default: return "bg-muted text-muted-foreground";
  }
}

function actionPriorityColor(priority: string | null) {
  switch (priority) {
    case "alta": return "bg-rose-500/15 text-rose-700 border-rose-500/30";
    case "media": return "bg-amber-500/15 text-amber-700 border-amber-500/30";
    case "baixa": return "bg-blue-500/15 text-blue-700 border-blue-500/30";
    default: return "bg-muted text-muted-foreground";
  }
}

async function callVeraActions(body: Record<string, unknown>): Promise<VeraActionsResponse> {
  const { data, error } = await supabase.functions.invoke("vera-lead-actions", { body });
  if (error) throw error;
  const payload = data as VeraActionsResponse;
  if (payload?.error) throw new Error(payload.error);
  return payload;
}

function ContactSkeleton() {
  return (
    <div className="p-3 border-b flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-12" /></div>
        <Skeleton className="h-3 w-40" />
      </div>
    </div>
  );
}

function MessageSkeleton() {
  return (
    <div className="space-y-3 py-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}>
          <Skeleton className={cn("h-12 rounded-lg", i % 2 === 0 ? "w-[60%]" : "w-[50%]")} />
        </div>
      ))}
    </div>
  );
}

export default function ConversasWhatsApp({ initialPhone }: { initialPhone?: string }) {
  const qc = useQueryClient();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [msgInput, setMsgInput] = useState("");
  const [sending, setSending] = useState(false);
  const [simulatedFollowUp, setSimulatedFollowUp] = useState<{ decision: string; note: string; text: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: veraNames = {} } = useQuery({
    queryKey: ["vera-whatsapp-names"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke("vera-conversation-logs", { body: {} });
        if (error) throw error;
        const contatos: VeraContatoResumo[] = (data as { contatos?: VeraContatoResumo[] })?.contatos ?? [];
        const map: Record<string, string> = {};
        for (const contato of contatos) {
          if (!String(contato.session_id ?? "").startsWith("wa:")) continue;
          const phone = normalizeWhatsappPhone(contato.session_id.replace(/^wa:/, ""));
          if (phone && contato.nome) map[phone] = contato.nome;
        }
        return map;
      } catch {
        return {} as Record<string, string>;
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

  const { data: leadNames = {} } = useQuery({
    queryKey: ["whatsapp-lead-names"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("phone, name, push_name").limit(1000);
      if (error) throw error;
      const map: Record<string, string> = {};
      for (const lead of data ?? []) {
        const phone = normalizeWhatsappPhone(lead.phone);
        const displayName = lead.push_name || lead.name;
        if (phone && displayName) map[phone] = displayName;
      }
      return map;
    },
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

  const { data: chats = [], isLoading: chatsLoading, refetch: refetchChats } = useQuery({
    queryKey: [
      "evo-chats",
      Object.entries(leadNames).sort().map(([phone, name]) => `${phone}:${name}`).join("|"),
      Object.entries(veraNames).sort().map(([phone, name]) => `${phone}:${name}`).join("|"),
    ],
    queryFn: async () => {
      const [chatsData, contactsData] = await Promise.all([
        evoProxy<EvoChat[]>("findChats", {}),
        evoProxy<EvoContact[]>("findContacts", {}),
      ]);
      const contactMap = new Map<string, EvoContact>();
      if (Array.isArray(contactsData)) contactsData.forEach((c) => contactMap.set(c.remoteJid, c));
      const { data: lastMsgs } = await supabase.from("conversations_log").select("remote_jid, message_text, created_at, direction, sent_by").order("created_at", { ascending: false }).limit(500);
      const lastMsgMap = new Map<string, { text: string; timestamp: string }>();
      if (lastMsgs) for (const m of lastMsgs) { if (!lastMsgMap.has(m.remote_jid)) lastMsgMap.set(m.remote_jid, { text: m.message_text || "[mídia]", timestamp: m.created_at || "" }); }
      return (Array.isArray(chatsData) ? chatsData : [])
        .filter((c) => c.remoteJid?.endsWith("@s.whatsapp.net"))
        .map((c) => {
          const contact = contactMap.get(c.remoteJid);
          const phone = normalizeWhatsappPhone(c.remoteJid.replace("@s.whatsapp.net", ""));
          const lastMsg = lastMsgMap.get(c.remoteJid);
          const name = resolveContactName({
            veraName: veraNames[phone],
            leadPushName: leadNames[phone],
            evoContactName: contact?.pushName || c.name,
            lastMessage: lastMsg?.text,
            messageHints: [c.name, contact?.pushName],
            phone,
          });
          return {
            remoteJid: c.remoteJid,
            name,
            profilePic: contact?.profilePicUrl || null,
            unread: c.unreadMessages || 0,
            lastMessage: lastMsg?.text,
            lastTimestamp: lastMsg?.timestamp ? new Date(lastMsg.timestamp).getTime() : undefined,
          } as ChatItem;
        })
        .sort((a, b) => (b.lastTimestamp ?? 0) - (a.lastTimestamp ?? 0));
    },
    refetchOnWindowFocus: false,
  });

  const { data: messages = [], isLoading: msgsLoading, refetch: refetchMsgs } = useQuery({
    queryKey: ["evo-messages", selectedChat],
    queryFn: async () => {
      if (!selectedChat) return [];
      const res = await evoProxy<{ messages?: { records?: EvoMessageRecord[] } }>("findMessages", { where: { key: { remoteJid: selectedChat } }, limit: 100 });
      return res?.messages?.records ?? [];
    },
    enabled: !!selectedChat,
    refetchOnWindowFocus: false,
  });

  const selectedPhone = selectedChat?.replace("@s.whatsapp.net", "") ?? "";
  const selectedVeraChatId = selectedPhone ? `wa:${selectedPhone}` : "";

  useEffect(() => {
    if (!initialPhone || selectedChat || !chats.length) return;
    const phone = normalizeWhatsappPhone(initialPhone);
    if (!phone) return;
    const targetJid = whatsappRemoteJidFromVeraChatId(`wa:${phone}`);
    const found = chats.find((chat) => chat.remoteJid === targetJid);
    if (found) setSelectedChat(found.remoteJid);
    else setSearchTerm(phone);
  }, [initialPhone, selectedChat, chats]);

  const { data: leadInfo } = useQuery({
    queryKey: ["lead-info", selectedPhone],
    queryFn: async () => {
      if (!selectedPhone) return null;
      const { data: existing } = await supabase.from("leads").select("*").eq("phone", selectedPhone).maybeSingle();
      if (existing) return existing;
      const chatInfo = chats.find((c) => c.remoteJid === selectedChat);
      const { data: created } = await supabase
        .from("leads")
        .insert({ phone: selectedPhone, push_name: chatInfo?.name ?? null, status: "novo" })
        .select()
        .single();
      return created;
    },
    enabled: !!selectedPhone,
  });

  // SPIN stage do chat
  const { data: spinState } = useQuery({
    queryKey: ["spin-state", selectedPhone],
    queryFn: async () => {
      if (!selectedPhone) return null;
      const chatId = `wa:${selectedPhone}`;
      const { data } = await supabase
        .from("vera_conversation_state")
        .select("spin_stage, stage_entered_at, updated_at")
        .eq("chat_id", chatId)
        .eq("channel", "whatsapp")
        .maybeSingle();
      return data;
    },
    enabled: !!selectedPhone,
  });

  const { data: veraActionsData, isFetching: actionsFetching } = useQuery({
    queryKey: ["vera-actions-chat", selectedVeraChatId],
    queryFn: () => callVeraActions({
      action: "list",
      search: selectedVeraChatId,
      include_future: true,
      limit: 20,
    }),
    enabled: !!selectedVeraChatId,
    refetchOnWindowFocus: false,
  });

  const veraActions = veraActionsData?.actions ?? [];
  const openVeraActions = veraActions.filter((action) => ["pending", "failed", "simulated"].includes(action.status));

  const markActionMutation = useMutation({
    mutationFn: ({ id, targetStatus }: { id: number; targetStatus: "ignored" | "pending" }) =>
      callVeraActions({
        action: "mark",
        action_id: id,
        target_status: targetStatus,
        note: targetStatus === "ignored" ? "Ignorado pela conversa WhatsApp" : "Reaberto pela conversa WhatsApp",
        include_future: true,
      }),
    onSuccess: () => {
      toast.success("Action da Vera atualizada");
      qc.invalidateQueries({ queryKey: ["vera-actions-chat", selectedVeraChatId] });
      qc.invalidateQueries({ queryKey: ["vera-lead-actions"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const simulateActionMutation = useMutation({
    mutationFn: (id: number) => callVeraActions({ action: "simulate", action_id: id }),
    onSuccess: (data) => {
      const item = data.items?.[0];
      setSimulatedFollowUp({
        decision: item?.decision || "-",
        note: item?.note || "",
        text: item?.followup_text || "",
      });
    },
    onError: (error) => toast.error(error.message),
  });

  // Metadados das msgs (áudio pendente, oculto da IA) — lookup no conversations_log
  const { data: convLogMeta = [] } = useQuery({
    queryKey: ["conv-log-meta", selectedChat],
    queryFn: async () => {
      if (!selectedChat) return [] as ConvLogMeta[];
      const { data } = await supabase
        .from("conversations_log")
        .select("id, whatsapp_message_id, is_audio, audio_pending, hidden_from_ai, message_text, deleted_at, deleted_by, deletion_reason")
        .eq("remote_jid", selectedChat)
        .order("created_at", { ascending: false })
        .limit(200);
      return (data ?? []) as ConvLogMeta[];
    },
    enabled: !!selectedChat,
  });

  const allPerms = usePermissions() as Record<string, { can_view: boolean }>;
  const canViewDeletedMsgs = allPerms["messages_audit"]?.can_view === true;

  const { data: allTags = [] } = useTags();

  // Mapa lead_id→tags para filtrar chats por tag
  const chatPhones = chats.map((c) => c.remoteJid.replace("@s.whatsapp.net", ""));
  const { data: leadsByPhone = {} } = useQuery({
    queryKey: ["leads-by-phone", chatPhones.slice(0, 50).join(",")],
    queryFn: async () => {
      if (!chatPhones.length) return {} as Record<string, string>;
      const { data } = await supabase
        .from("leads")
        .select("id, phone")
        .in("phone", chatPhones.slice(0, 50));
      const map: Record<string, string> = {};
      for (const l of data ?? []) map[l.phone] = l.id;
      return map;
    },
    enabled: chatPhones.length > 0,
  });

  const leadIds = Object.values(leadsByPhone);
  const { data: tagsMap = {} } = useLeadTagsMap(leadIds);

  const softDeleteConvLog = async (logId: string) => {
    const { error } = await supabase
      .from("conversations_log")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", logId);
    if (error) { toast.error("Erro: " + error.message); return; }
    qc.invalidateQueries({ queryKey: ["conv-log-meta", selectedChat] });
    toast.success("Mensagem removida do histórico da IA.");
  };

  const metaByMsgId = new Map<string, ConvLogMeta>();
  for (const m of convLogMeta) {
    if (m.whatsapp_message_id) metaByMsgId.set(m.whatsapp_message_id, m);
  }

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    const channel = supabase
      .channel("conversations-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "conversations_log" }, (payload) => {
        if ((payload.new as any).remote_jid === selectedChat) {
          refetchMsgs();
          qc.invalidateQueries({ queryKey: ["conv-log-meta", selectedChat] });
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "conversations_log" }, (payload) => {
        if ((payload.new as any).remote_jid === selectedChat) {
          qc.invalidateQueries({ queryKey: ["conv-log-meta", selectedChat] });
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "vera_conversation_state" }, () => {
        qc.invalidateQueries({ queryKey: ["spin-state", selectedPhone] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedChat, selectedPhone, refetchMsgs, qc]);

  const handleSend = async () => {
    if (!msgInput.trim() || !selectedChat) return;
    setSending(true);
    try {
      await evoProxy("sendText", { number: selectedChat.replace("@s.whatsapp.net", ""), text: msgInput.trim() });
      setMsgInput(""); toast.success("Mensagem enviada!"); setTimeout(() => refetchMsgs(), 1000);
    } catch (e: any) { toast.error("Erro ao enviar: " + e.message); } finally { setSending(false); }
  };

  const toggleAI = async () => {
    if (!leadInfo) return;
    const newVal = !leadInfo.ai_enabled;
    await supabase.from("leads").update({ ai_enabled: newVal }).eq("phone", selectedPhone);
    qc.invalidateQueries({ queryKey: ["lead-info", selectedPhone] });
    toast.success(newVal ? "IA reativada" : "IA desativada — você assumiu a conversa");
  };

  const toggleHiddenFromAI = async (logId: string, current: boolean) => {
    const { error } = await supabase
      .from("conversations_log")
      .update({ hidden_from_ai: !current })
      .eq("id", logId);
    if (error) { toast.error("Erro: " + error.message); return; }
    qc.invalidateQueries({ queryKey: ["conv-log-meta", selectedChat] });
    toast.success(!current ? "Mensagem oculta da IA" : "Mensagem visível para a IA");
  };

  const getMsgText = (msg: EvoMessageRecord, meta?: ConvLogMeta) => {
    // Se há texto no log (ex.: transcrição já chegou), prefere ele
    if (meta?.message_text && !meta.audio_pending) return meta.message_text;
    if (!msg.message) return "[mídia]";
    return msg.message.conversation || msg.message.extendedTextMessage || msg.message.caption || `[${msg.messageType}]`;
  };

  const filteredChats = chats.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.remoteJid.includes(searchTerm);
    if (!matchSearch) return false;
    if (selectedTagIds.length === 0) return true;
    const phone = c.remoteJid.replace("@s.whatsapp.net", "");
    const leadId = leadsByPhone[phone];
    if (!leadId) return false;
    const leadTags = (tagsMap[leadId] ?? []).map((t) => t.id);
    return selectedTagIds.some((id) => leadTags.includes(id));
  });
  const selectedChatInfo = chats.find((c) => c.remoteJid === selectedChat);

  const spinStage = spinState?.spin_stage as string | undefined;

  return (
    <TooltipProvider delayDuration={200}>
    <div className="h-full flex rounded-lg border overflow-hidden bg-background">
      <div className={cn("w-full md:w-[340px] lg:w-[380px] border-r flex flex-col shrink-0", selectedChat ? "hidden md:flex" : "flex")}>
        <div className="p-3 border-b space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Conversas</h3>
            <Button variant="ghost" size="icon" onClick={() => refetchChats()}><RefreshCw className="h-4 w-4" /></Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar contato..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
          </div>
          {allTags.length > 0 && (
            <TagFilter
              tags={allTags}
              selected={selectedTagIds}
              onChange={setSelectedTagIds}
              placeholder="Tag"
              className="flex-wrap"
            />
          )}
        </div>
        <ScrollArea className="flex-1">
          {chatsLoading ? Array.from({ length: 8 }).map((_, i) => <ContactSkeleton key={i} />) : filteredChats.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">Nenhuma conversa</div>
          ) : filteredChats.map((chat) => (
            <button key={chat.remoteJid} onClick={() => setSelectedChat(chat.remoteJid)} className={cn("w-full text-left p-3 hover:bg-muted/50 transition-colors border-b flex items-center gap-3", selectedChat === chat.remoteJid && "bg-muted")}>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                {chat.profilePic ? <img src={chat.profilePic} className="h-10 w-10 rounded-full object-cover" alt="" /> : <User className="h-5 w-5 text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm truncate">{chat.name}</p>
                  <span className="text-[11px] text-muted-foreground ml-2 shrink-0">{chat.lastTimestamp ? formatDistanceToNow(new Date(chat.lastTimestamp), { addSuffix: true, locale: ptBR }) : ""}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-muted-foreground truncate flex-1 mr-2">{chat.lastMessage || chat.remoteJid.replace("@s.whatsapp.net", "")}</p>
                  {chat.unread > 0 && <Badge variant="default" className="text-xs h-5 min-w-5 flex items-center justify-center shrink-0">{chat.unread}</Badge>}
                </div>
              </div>
            </button>
          ))}
        </ScrollArea>
      </div>

      <div className={cn("flex-1 flex flex-col", !selectedChat ? "hidden md:flex" : "flex")}>
        {!selectedChat ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">Selecione uma conversa para visualizar</div>
        ) : (
          <>
            <div className="border-b shrink-0">
              <div className="h-14 flex items-center px-4 gap-3">
                <button className="md:hidden" onClick={() => setSelectedChat(null)}><ArrowLeft className="h-5 w-5" /></button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">{selectedChatInfo?.name || selectedPhone}</p>
                    {spinStage && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-medium px-1.5 py-0 h-5",
                              SPIN_COLORS[spinStage] ?? "bg-muted",
                            )}
                          >
                            SPIN: {SPIN_LABELS[spinStage] ?? spinStage}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            Estágio atual da conversa no protocolo SPIN.
                            {spinState?.stage_entered_at && (
                              <>
                                {" "}Entrou{" "}
                                {formatDistanceToNow(new Date(spinState.stage_entered_at), {
                                  addSuffix: true,
                                  locale: ptBR,
                                })}
                                .
                              </>
                            )}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{selectedPhone}</p>
                </div>
                <div className="flex items-center gap-2">
                  {leadInfo && (
                    <Button variant="outline" size="sm" onClick={toggleAI} className={cn("text-xs gap-1", leadInfo.ai_enabled ? "text-green-600 border-green-500" : "text-amber-600 border-amber-500")}>
                      {leadInfo.ai_enabled ? <><Bot className="h-3.5 w-3.5" /> IA Ativa</> : <><User className="h-3.5 w-3.5" /> Humano</>}
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => refetchMsgs()}><RefreshCw className="h-4 w-4" /></Button>
                </div>
              </div>
              {leadInfo && (
                <div className="px-4 pb-2">
                  <LeadTagsEditor leadId={leadInfo.id} size="sm" />
                </div>
              )}
              {(openVeraActions.length > 0 || actionsFetching) && (
                <div className="border-t bg-muted/25 px-4 py-2">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <ListChecks className="h-3.5 w-3.5" />
                      Actions Vera
                      {actionsFetching && <RefreshCw className="h-3 w-3 animate-spin" />}
                    </div>
                    <Badge variant="outline" className="text-[10px]">{openVeraActions.length} aberta{openVeraActions.length === 1 ? "" : "s"}</Badge>
                  </div>
                  <div className="space-y-1.5">
                    {openVeraActions.slice(0, 3).map((action) => (
                      <div key={action.id} className="flex flex-col gap-2 rounded-md border bg-background/80 p-2 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-1">
                            <Badge variant="outline" className={cn("text-[10px]", actionStatusColor(action.status))}>{action.status}</Badge>
                            <Badge variant="outline" className={cn("text-[10px]", actionPriorityColor(action.prioridade))}>{action.prioridade || "-"}</Badge>
                            <span className="text-xs font-medium">{action.reason || action.action_type}</span>
                          </div>
                          <p className="truncate text-xs text-muted-foreground">
                            {action.ultimo_interesse || "sem interesse"} · score {action.score ?? 0}
                            {action.patient_replied_after_action ? " · paciente respondeu depois" : ""}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                            onClick={() => simulateActionMutation.mutate(action.id)}
                            disabled={simulateActionMutation.isPending}
                          >
                            <ShieldCheck className="mr-1 h-3 w-3" />
                            Simular
                          </Button>
                          {action.status === "pending" ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs"
                              onClick={() => markActionMutation.mutate({ id: action.id, targetStatus: "ignored" })}
                              disabled={markActionMutation.isPending}
                            >
                              <XCircle className="mr-1 h-3 w-3" />
                              Ignorar
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs"
                              onClick={() => markActionMutation.mutate({ id: action.id, targetStatus: "pending" })}
                              disabled={markActionMutation.isPending}
                            >
                              <RotateCcw className="mr-1 h-3 w-3" />
                              Reabrir
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <ScrollArea className="flex-1 p-4">
              {msgsLoading ? <MessageSkeleton /> : messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">Nenhuma mensagem</div>
              ) : (
                <div className="space-y-2">
                  {[...messages].reverse().map((msg) => {
                    const isFromMe = msg.key.fromMe;
                    const meta = metaByMsgId.get(msg.key.id);
                    const text = getMsgText(msg, meta);
                    const time = msg.messageTimestamp ? format(new Date(msg.messageTimestamp * 1000), "HH:mm") : "";
                    const isAudio = !!meta?.is_audio;
                    const audioPending = !!meta?.audio_pending;
                    const hidden = !!meta?.hidden_from_ai;
                    const isDeleted = !!meta?.deleted_at;

                    // Mensagem apagada — exibe badge no lugar da bubble
                    if (isDeleted) {
                      if (!canViewDeletedMsgs) {
                        return (
                          <div key={msg.key.id} className={cn("flex", isFromMe ? "justify-end" : "justify-start")}>
                            <DeletedMessageBadge
                              originalContent={text}
                              info={{ deletedAt: meta!.deleted_at! }}
                              canViewContent={false}
                              className="max-w-[75%]"
                            />
                          </div>
                        );
                      }
                      return (
                        <div key={msg.key.id} className={cn("flex", isFromMe ? "justify-end" : "justify-start")}>
                          <DeletedMessageBadge
                            originalContent={text}
                            info={{
                              deletedAt: meta!.deleted_at!,
                              deletedBy: meta!.deleted_by ?? undefined,
                              reason: meta!.deletion_reason ?? undefined,
                            }}
                            canViewContent={true}
                            className="max-w-[75%]"
                          />
                        </div>
                      );
                    }

                    return (
                      <div key={msg.key.id} className={cn("flex group", isFromMe ? "justify-end" : "justify-start")}>
                        <div
                          className={cn(
                            "max-w-[75%] rounded-lg px-3 py-2 text-sm relative",
                            isFromMe ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none",
                            hidden && "opacity-60 ring-1 ring-dashed ring-muted-foreground",
                          )}
                        >
                          {isAudio && (
                            <div
                              className={cn(
                                "flex items-center gap-1 text-[10px] mb-1 font-medium",
                                isFromMe ? "text-primary-foreground/80" : "text-muted-foreground",
                              )}
                            >
                              {audioPending ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Áudio — transcrevendo…
                                </>
                              ) : (
                                <>
                                  <Mic className="h-3 w-3" />
                                  Áudio (transcrição)
                                </>
                              )}
                            </div>
                          )}
                          <p className="whitespace-pre-wrap break-words">{text}</p>
                          <div className="flex items-center justify-between gap-2 mt-1">
                            {hidden && (
                              <span
                                className={cn(
                                  "text-[10px] flex items-center gap-1",
                                  isFromMe ? "text-primary-foreground/70" : "text-muted-foreground",
                                )}
                              >
                                <EyeOff className="h-3 w-3" /> oculta da IA
                              </span>
                            )}
                            <p
                              className={cn(
                                "text-[10px] ml-auto",
                                isFromMe ? "text-primary-foreground/70" : "text-muted-foreground",
                              )}
                            >
                              {time}
                            </p>
                          </div>

                          {meta && (
                            <div
                              className={cn(
                                "absolute -top-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity",
                                isFromMe ? "-left-2 flex-row-reverse" : "-right-2",
                              )}
                            >
                              {/* Toggle ocultar da IA */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={() => toggleHiddenFromAI(meta.id, hidden)}
                                    className="rounded-full bg-background border shadow-sm p-1 hover:bg-muted"
                                    aria-label={hidden ? "Tornar visível para a IA" : "Ocultar da IA"}
                                  >
                                    {hidden ? (
                                      <Eye className="h-3 w-3 text-foreground" />
                                    ) : (
                                      <EyeOff className="h-3 w-3 text-foreground" />
                                    )}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="text-xs">
                                    {hidden ? "Tornar visível para a IA" : "Ocultar essa mensagem da IA"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>

                              {/* Soft delete — apenas admin/supervisor */}
                              {canViewDeletedMsgs && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      onClick={() => softDeleteConvLog(meta.id)}
                                      className="rounded-full bg-background border shadow-sm p-1 hover:bg-destructive/10 hover:border-destructive/30"
                                      aria-label="Apagar mensagem (auditável)"
                                    >
                                      <Trash2 className="h-3 w-3 text-destructive" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <p className="text-xs">Apagar mensagem (fica no audit)</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>
            <div className="border-t p-3 flex gap-2 shrink-0">
              <Input placeholder="Digite uma mensagem..." value={msgInput} onChange={(e) => setMsgInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()} disabled={sending} className="flex-1" />
              <Button onClick={handleSend} disabled={sending || !msgInput.trim()}><Send className="h-4 w-4" /></Button>
            </div>
          </>
        )}
      </div>
      <Dialog open={!!simulatedFollowUp} onOpenChange={(open) => !open && setSimulatedFollowUp(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Simulacao da Vera
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-medium uppercase text-muted-foreground">Decisao</p>
              <p className="text-sm">{simulatedFollowUp?.decision || "-"}</p>
            </div>
            {simulatedFollowUp?.note && (
              <div>
                <p className="text-[11px] font-medium uppercase text-muted-foreground">Nota</p>
                <p className="text-sm">{simulatedFollowUp.note}</p>
              </div>
            )}
            <div>
              <p className="mb-1 text-[11px] font-medium uppercase text-muted-foreground">Texto que seria usado</p>
              <p className="whitespace-pre-wrap rounded border bg-muted/40 p-3 text-sm">
                {simulatedFollowUp?.text || "Nenhum texto retornado."}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (!simulatedFollowUp?.text) return;
                setMsgInput(simulatedFollowUp.text);
                setSimulatedFollowUp(null);
                toast.info("Texto colocado no campo de mensagem para revisao");
              }}
              disabled={!simulatedFollowUp?.text}
            >
              Usar no campo
            </Button>
            <Button onClick={() => setSimulatedFollowUp(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  );
}
