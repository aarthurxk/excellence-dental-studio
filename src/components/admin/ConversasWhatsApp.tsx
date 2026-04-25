import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { evoProxy } from "@/hooks/useEvoProxy";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Send, RefreshCw, ArrowLeft, Bot, User } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import LeadTagsEditor from "@/components/admin/LeadTagsEditor";

interface EvoChat { remoteJid: string; name: string | null; unreadMessages: number; }
interface EvoContact { remoteJid: string; pushName: string | null; profilePicUrl: string | null; }
interface EvoMessageRecord { key: { id: string; fromMe: boolean; remoteJid: string }; pushName: string | null; messageType: string; message: Record<string, string>; messageTimestamp: number; }
interface ChatItem { remoteJid: string; name: string; profilePic: string | null; unread: number; lastMessage?: string; lastTimestamp?: number; }

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

export default function ConversasWhatsApp() {
  const qc = useQueryClient();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [msgInput, setMsgInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chats = [], isLoading: chatsLoading, refetch: refetchChats } = useQuery({
    queryKey: ["evo-chats"],
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
          const phone = c.remoteJid.replace("@s.whatsapp.net", "");
          const lastMsg = lastMsgMap.get(c.remoteJid);
          return { remoteJid: c.remoteJid, name: contact?.pushName || c.name || phone, profilePic: contact?.profilePicUrl || null, unread: c.unreadMessages || 0, lastMessage: lastMsg?.text, lastTimestamp: lastMsg?.timestamp ? new Date(lastMsg.timestamp).getTime() : undefined } as ChatItem;
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
  const { data: leadInfo } = useQuery({
    queryKey: ["lead-info", selectedPhone],
    queryFn: async () => {
      if (!selectedPhone) return null;
      const { data: existing } = await supabase.from("leads").select("*").eq("phone", selectedPhone).maybeSingle();
      if (existing) return existing;
      // Cria lead "stub" automaticamente para permitir etiquetas/notas
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


  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    const channel = supabase.channel("conversations-rt").on("postgres_changes", { event: "INSERT", schema: "public", table: "conversations_log" }, (payload) => { if ((payload.new as any).remote_jid === selectedChat) refetchMsgs(); }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedChat, refetchMsgs]);

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

  const getMsgText = (msg: EvoMessageRecord) => {
    if (!msg.message) return "[mídia]";
    return msg.message.conversation || msg.message.extendedTextMessage || msg.message.caption || `[${msg.messageType}]`;
  };

  const filteredChats = chats.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.remoteJid.includes(searchTerm));
  const selectedChatInfo = chats.find((c) => c.remoteJid === selectedChat);

  return (
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
                  <p className="font-semibold text-sm truncate">{selectedChatInfo?.name || selectedPhone}</p>
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
            </div>

            <ScrollArea className="flex-1 p-4">
              {msgsLoading ? <MessageSkeleton /> : messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">Nenhuma mensagem</div>
              ) : (
                <div className="space-y-2">
                  {[...messages].reverse().map((msg) => {
                    const isFromMe = msg.key.fromMe;
                    const text = getMsgText(msg);
                    const time = msg.messageTimestamp ? format(new Date(msg.messageTimestamp * 1000), "HH:mm") : "";
                    return (
                      <div key={msg.key.id} className={cn("flex", isFromMe ? "justify-end" : "justify-start")}>
                        <div className={cn("max-w-[75%] rounded-lg px-3 py-2 text-sm", isFromMe ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none")}>
                          <p className="whitespace-pre-wrap break-words">{text}</p>
                          <p className={cn("text-[10px] mt-1 text-right", isFromMe ? "text-primary-foreground/70" : "text-muted-foreground")}>{time}</p>
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
    </div>
  );
}
