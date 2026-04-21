import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { Bot, Loader2, MessageCircleMore, SendHorizontal, Sparkles, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const CHAT_STORAGE_KEY = "odonto-excellence-site-chat";
const SESSION_STORAGE_KEY = "odonto-excellence-site-chat-session";
const WEBHOOK_URL = import.meta.env.VITE_CHAT_WEBHOOK_URL || "https://bot.odontoexcellencerecife.com.br/webhook/site-chat-v4";
const MIN_ASSISTANT_DELAY_MS = 1200;
const MAX_ASSISTANT_DELAY_MS = 2400;

const WELCOME_MESSAGE =
  "Oi, tudo bem? Sou Vera, trabalho aqui na Clinica Odonto Excellence Recife. Como posso te ajudar?";

type Sender = "assistant" | "user";

type ChatMessage = {
  id: string;
  sender: Sender;
  text: string;
  createdAt: string;
};

type StoredChatState = {
  messages: ChatMessage[];
};

type ChatApiResponse =
  | string
  | {
      reply?: string;
      response?: string;
      message?: string;
      output?: string;
      text?: string;
      data?: {
        reply?: string;
        response?: string;
        message?: string;
        output?: string;
        text?: string;
      };
    };

function createMessage(sender: Sender, text: string): ChatMessage {
  return {
    id: `${sender}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sender,
    text,
    createdAt: new Date().toISOString(),
  };
}

function readStoredState(): StoredChatState {
  if (typeof window === "undefined") {
    return { messages: [createMessage("assistant", WELCOME_MESSAGE)] };
  }

  try {
    const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) {
      return { messages: [createMessage("assistant", WELCOME_MESSAGE)] };
    }

    const parsed = JSON.parse(raw) as StoredChatState;
    if (!Array.isArray(parsed.messages) || parsed.messages.length === 0) {
      return { messages: [createMessage("assistant", WELCOME_MESSAGE)] };
    }

    return parsed;
  } catch {
    return { messages: [createMessage("assistant", WELCOME_MESSAGE)] };
  }
}

function getSessionId(): string {
  if (typeof window === "undefined") {
    return "server-session";
  }

  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const generated = window.crypto?.randomUUID?.() ?? `session-${Date.now()}`;
  window.localStorage.setItem(SESSION_STORAGE_KEY, generated);
  return generated;
}

function extractReply(payload: ChatApiResponse): string | null {
  if (typeof payload === "string") {
    return payload.trim() || null;
  }

  const candidates = [
    payload.reply,
    payload.response,
    payload.message,
    payload.output,
    payload.text,
    payload.data?.reply,
    payload.data?.response,
    payload.data?.message,
    payload.data?.output,
    payload.data?.text,
  ];

  const firstValid = candidates.find((value) => typeof value === "string" && value.trim().length > 0);
  return firstValid?.trim() ?? null;
}

function getOriginDetails() {
  if (typeof window === "undefined") {
    return {};
  }

  const url = new URL(window.location.href);

  return {
    pageUrl: window.location.href,
    path: window.location.pathname,
    referrer: document.referrer || null,
    utm: {
      source: url.searchParams.get("utm_source"),
      medium: url.searchParams.get("utm_medium"),
      campaign: url.searchParams.get("utm_campaign"),
      content: url.searchParams.get("utm_content"),
      term: url.searchParams.get("utm_term"),
    },
  };
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function getAssistantDelay() {
  return Math.floor(Math.random() * (MAX_ASSISTANT_DELAY_MS - MIN_ASSISTANT_DELAY_MS + 1)) + MIN_ASSISTANT_DELAY_MS;
}

const SiteChatWidget = () => {
  const { data: settings } = useSiteSettings();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => readStoredState().messages);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const sessionId = useMemo(() => getSessionId(), []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({ messages }));
  }, [messages]);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    const cleaned = text.trim();
    if (!cleaned || isLoading) {
      return;
    }

    const outgoing = createMessage("user", cleaned);
    const fallbackReply =
      "Tô te ouvindo por aqui, viu? Nosso atendimento online já já volta certinho. Se preferir, também pode falar com a gente no WhatsApp.";

    setMessages((current) => [...current, outgoing]);
    setInput("");
    setIsLoading(true);
    const startedAt = Date.now();

    if (!WEBHOOK_URL) {
      await wait(getAssistantDelay());
      setMessages((current) => [...current, createMessage("assistant", fallbackReply)]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel: "website",
          sessionId,
          message: cleaned,
          contact: {
            source: "website",
          },
          metadata: getOriginDetails(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = (await response.json()) as ChatApiResponse;
      const reply = extractReply(payload) ?? fallbackReply;
      const elapsed = Date.now() - startedAt;
      const targetDelay = getAssistantDelay();

      if (elapsed < targetDelay) {
        await wait(targetDelay - elapsed);
      }

      setMessages((current) => [...current, createMessage("assistant", reply)]);
    } catch {
      const elapsed = Date.now() - startedAt;
      const targetDelay = getAssistantDelay();

      if (elapsed < targetDelay) {
        await wait(targetDelay - elapsed);
      }

      setMessages((current) => [...current, createMessage("assistant", fallbackReply)]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendMessage(input);
  };

  const handleKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    await sendMessage(input);
  };

  if (settings?.chat_enabled === false) return null;

  return (
    <>
      <div className="fixed bottom-20 right-4 z-[9998] hidden md:block md:bottom-24 md:right-6">
        <span className="mb-3 block rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#111111] shadow-lg">
          Atendimento online
        </span>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-[9998] flex h-12 w-12 items-center justify-center rounded-full bg-[#d72638] text-white shadow-xl transition-transform duration-300 hover:scale-105 md:bottom-24 md:right-6 md:h-14 md:w-14"
        aria-label="Abrir chat da clínica"
      >
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#d72638] opacity-30 animate-ping" />
        <MessageCircleMore className="relative z-10 h-6 w-6 md:h-7 md:w-7" />
      </button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className={cn(
            "flex h-[82vh] flex-col border-0 bg-[#fffaf7] p-0 sm:max-w-[420px]",
            isMobile && "rounded-t-[28px]"
          )}
        >
          <SheetHeader className="border-b border-black/5 bg-[#111111] px-5 py-5 text-left text-white">
            <div className="flex items-start justify-between gap-3 pr-8">
              <div className="space-y-2">
                <Badge className="w-fit border-0 bg-white/12 text-white hover:bg-white/12">
                  Atendimento acolhedor
                </Badge>
                <SheetTitle className="flex items-center gap-2 text-xl font-semibold text-white">
                  <Bot className="h-5 w-5" />
                  Vera
                </SheetTitle>
                <SheetDescription className="max-w-[28rem] text-sm leading-6 text-white/80">
                  Oi, tudo bem? Sou Vera, trabalho aqui na Clinica Odonto Excellence Recife. Como posso te ajudar?
                </SheetDescription>
              </div>
              <Sparkles className="mt-1 h-5 w-5 text-white/65" />
            </div>
          </SheetHeader>

          <Card className="mx-4 mt-4 border-[#f1dfda] bg-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)]">
            <CardContent className="px-4 py-3 text-sm text-[#4b4b4b]">
              Se quiser, posso te orientar sobre implante, protese, aparelho, clinica geral e outros tratamentos.
            </CardContent>
          </Card>

          <ScrollArea className="flex-1 px-4 py-4">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex", message.sender === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm",
                      message.sender === "user"
                        ? "rounded-br-md bg-[#d72638] text-white"
                        : "rounded-bl-md border border-[#f0e1db] bg-white text-[#1f1f1f]"
                    )}
                  >
                    <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] opacity-70">
                      {message.sender === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                      {message.sender === "user" ? "Você" : "Vera"}
                    </div>
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-3xl rounded-bl-md border border-[#f0e1db] bg-white px-4 py-3 text-sm text-[#444444] shadow-sm">
                    <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] opacity-70">
                      <Bot className="h-3.5 w-3.5" />
                      Vera
                    </div>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Vera esta escrevendo...
                    </div>
                  </div>
                </div>
              )}

              <div ref={scrollAnchorRef} />
            </div>
          </ScrollArea>

          <div className="border-t border-black/5 bg-white px-4 py-4">
            <form className="space-y-3" onSubmit={handleSubmit}>
              <Input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escreva sua mensagem por aqui"
                className="h-11 rounded-2xl border-[#ead7d1] bg-[#fffaf7] px-4 text-[15px] md:h-12"
              />

              <div className="flex items-end justify-between gap-3">
                <p className="max-w-[220px] text-xs leading-5 text-muted-foreground">
                  Se preferir, a Vera pode te encaminhar pra equipe em seguida.
                </p>
                <Button
                  type="submit"
                  className="h-11 min-w-[112px] rounded-2xl bg-[#d72638] px-5 text-white shadow-[0_12px_30px_-18px_rgba(215,38,56,0.9)] hover:bg-[#bf2030]"
                  disabled={isLoading || !input.trim()}
                >
                  Enviar
                  <SendHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default SiteChatWidget;
