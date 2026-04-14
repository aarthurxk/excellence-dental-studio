import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { evoProxy } from "@/hooks/useEvoProxy";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search, Send, RefreshCw, ArrowLeft, Bot, User, ToggleLeft, ToggleRight,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EvoChat {
  remoteJid: string;
  name: string | null;
  unreadMessages: number;
}

interface EvoContact {
  remoteJid: string;
  pushName: string | null;
  profilePicUrl: string | null;
}

interface EvoMessageRecord {
  key: {
    id: string;
    fromMe: boolean;
    remoteJid: string;
  };
  pushName: string | null;
  messageType: string;
  message: Record<string, string>;
  messageTimestamp: number;
}

interface ChatItem {
  remoteJid: string;
  name: string;
  profilePic: string | null;
  unread: number;
  lastMessage?: string;
}

export default function AdminConversas() {
  const qc = useQueryClient();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [msgInput, setMsgInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chats
  const { data: chats = [], isLoading: chatsLoading, refetch: refetchChats } = useQuery({
    queryKey: ["evo-chats"],
    queryFn: async () => {
      const [chatsData, contactsData] = await Promise.all([
        evoProxy<EvoChat[]>("findChats", {}),
        evoProxy<EvoContact[]>("findContacts", {}),
      ]);

      const contactMap = new Map<string, EvoContact>();
      if (Array.isArray(contactsData)) {
        contactsData.forEach((c) => contactMap.set(c.remoteJid, c));
      }

      const chatList: ChatItem[] = (Array.isArray(chatsData) ? chatsData : [])
        .filter((c) => c.remoteJid?.endsWith("@s.whatsapp.net"))
        .map((c) => {
          const contact = contactMap.get(c.remoteJid);
          const phone = c.remoteJid.replace("@s.whatsapp.net", "");
          return {
            remoteJid: c.remoteJid,
            name: contact?.pushName || c.name || phone,
            profilePic: contact?.profilePicUrl || null,
            unread: c.unreadMessages || 0,
          };
        });

      return chatList;
    },
    refetchOnWindowFocus: false,
  });

  // Fetch messages for selected chat
  const { data: messages = [], isLoading: msgsLoading, refetch: refetchMsgs } = useQuery({
    queryKey: ["evo-messages", selectedChat],
    queryFn: async () => {
      if (!selectedChat) return [];
      const res = await evoProxy<{ messages?: { records?: EvoMessageRecord[] } }>(
        "findMessages",
        {
          where: { key: { remoteJid: selectedChat } },
          limit: 100,
        }
      );
      return res?.messages?.records ?? [];
    },
    enabled: !!selectedChat,
    refetchOnWindowFocus: false,
  });

  // Lead info for selected chat
  const selectedPhone = selectedChat?.replace("@s.whatsapp.net", "") ?? "";
  const { data: leadInfo } = useQuery({
    queryKey: ["lead-info", selectedPhone],
    queryFn: async () => {
      if (!selectedPhone) return null;
      const { data } = await supabase
        .from("leads")
        .select("*")
        .eq("phone", selectedPhone)
        .maybeSingle();
      return data;
    },
    enabled: !!selectedPhone,
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime for new messages
  useEffect(() => {
    const channel = supabase
      .channel("conversations-rt")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "conversations_log",
      }, (payload) => {
        const jid = (payload.new as any).remote_jid;
        if (jid === selectedChat) {
          refetchMsgs();
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedChat, refetchMsgs]);

  // Send message
  const handleSend = async () => {
    if (!msgInput.trim() || !selectedChat) return;
    setSending(true);
    try {
      const phone = selectedChat.replace("@s.whatsapp.net", "");
      await evoProxy("sendText", { number: phone, text: msgInput.trim() });
      setMsgInput("");
      toast.success("Mensagem enviada!");
      setTimeout(() => refetchMsgs(), 1000);
    } catch (e: any) {
      toast.error("Erro ao enviar: " + e.message);
    } finally {
      setSending(false);
    }
  };

  // Toggle AI
  const toggleAI = async () => {
    if (!leadInfo) return;
    const newVal = !leadInfo.ai_enabled;
    await supabase.from("leads").update({ ai_enabled: newVal }).eq("phone", selectedPhone);
    qc.invalidateQueries({ queryKey: ["lead-info", selectedPhone] });
    toast.success(newVal ? "IA reativada" : "IA desativada — você assumiu a conversa");
  };

  // Extract message text
  const getMsgText = (msg: EvoMessageRecord) => {
    if (!msg.message) return "[mídia]";
    return (
      msg.message.conversation ||
      msg.message.extendedTextMessage ||
      msg.message.caption ||
      `[${msg.messageType}]`
    );
  };

  // Filter chats
  const filteredChats = chats.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.remoteJid.includes(searchTerm)
  );

  const selectedChatInfo = chats.find((c) => c.remoteJid === selectedChat);

  return (
    <div className="h-[calc(100vh-7rem)] flex rounded-lg border overflow-hidden bg-background">
      {/* Contacts List */}
      <div
        className={cn(
          "w-full md:w-[340px] lg:w-[380px] border-r flex flex-col shrink-0",
          selectedChat ? "hidden md:flex" : "flex"
        )}
      >
        {/* Search header */}
        <div className="p-3 border-b space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Conversas</h3>
            <Button variant="ghost" size="icon" onClick={() => refetchChats()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Chat list */}
        <ScrollArea className="flex-1">
          {chatsLoading ? (
            <div className="p-4 text-center text-muted-foreground">Carregando...</div>
          ) : filteredChats.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">Nenhuma conversa</div>
          ) : (
            filteredChats.map((chat) => (
              <button
                key={chat.remoteJid}
                onClick={() => setSelectedChat(chat.remoteJid)}
                className={cn(
                  "w-full text-left p-3 hover:bg-muted/50 transition-colors border-b flex items-center gap-3",
                  selectedChat === chat.remoteJid && "bg-muted"
                )}
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  {chat.profilePic ? (
                    <img src={chat.profilePic} className="h-10 w-10 rounded-full object-cover" alt="" />
                  ) : (
                    <User className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm truncate">{chat.name}</p>
                    {chat.unread > 0 && (
                      <Badge variant="default" className="ml-2 text-xs h-5 min-w-5 flex items-center justify-center">
                        {chat.unread}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {chat.remoteJid.replace("@s.whatsapp.net", "")}
                  </p>
                </div>
              </button>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div
        className={cn(
          "flex-1 flex flex-col",
          !selectedChat ? "hidden md:flex" : "flex"
        )}
      >
        {!selectedChat ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Selecione uma conversa para visualizar
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="h-14 border-b flex items-center px-4 gap-3 shrink-0">
              <button
                className="md:hidden"
                onClick={() => setSelectedChat(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {selectedChatInfo?.name || selectedPhone}
                </p>
                <p className="text-xs text-muted-foreground">{selectedPhone}</p>
              </div>
              <div className="flex items-center gap-2">
                {leadInfo && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAI}
                    className={cn(
                      "text-xs gap-1",
                      leadInfo.ai_enabled
                        ? "text-green-600 border-green-500"
                        : "text-amber-600 border-amber-500"
                    )}
                  >
                    {leadInfo.ai_enabled ? (
                      <>
                        <Bot className="h-3.5 w-3.5" /> IA Ativa
                      </>
                    ) : (
                      <>
                        <User className="h-3.5 w-3.5" /> Humano
                      </>
                    )}
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => refetchMsgs()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {msgsLoading ? (
                <div className="text-center text-muted-foreground py-8">Carregando mensagens...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">Nenhuma mensagem</div>
              ) : (
                <div className="space-y-2">
                  {[...messages].reverse().map((msg) => {
                    const isFromMe = msg.key.fromMe;
                    const text = getMsgText(msg);
                    const time = msg.messageTimestamp
                      ? format(new Date(msg.messageTimestamp * 1000), "HH:mm")
                      : "";
                    return (
                      <div
                        key={msg.key.id}
                        className={cn(
                          "flex",
                          isFromMe ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                            isFromMe
                              ? "bg-primary text-primary-foreground rounded-br-none"
                              : "bg-muted rounded-bl-none"
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words">{text}</p>
                          <p
                            className={cn(
                              "text-[10px] mt-1 text-right",
                              isFromMe ? "text-primary-foreground/70" : "text-muted-foreground"
                            )}
                          >
                            {time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="border-t p-3 flex gap-2 shrink-0">
              <Input
                placeholder="Digite uma mensagem..."
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                disabled={sending}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={sending || !msgInput.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
