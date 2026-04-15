import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { RefreshCw, MessageCircle, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Mensagem { tipo: "human" | "ai"; conteudo: string; timestamp: string; }
interface Contato { session_id: string; nome: string; ultima_mensagem: string; updated_at: string; mensagens: Mensagem[]; }

function parseAiContent(raw: string): string {
  const respostaMatch = raw.match(/<resposta>([\s\S]*?)<\/resposta>/);
  let text = respostaMatch ? respostaMatch[1] : raw;
  text = text.replace(/<proximo_estagio>[\s\S]*?<\/proximo_estagio>/g, "");
  text = text.replace(/\[CONTEXTO_SESSAO\][\s\S]*?(\[\/CONTEXTO_SESSAO\]|$)/g, "");
  return text.trim();
}

function formatTimestamp(ts: string) {
  try { return format(new Date(ts), "dd/MM HH:mm", { locale: ptBR }); } catch { return ts; }
}

async function fetchVeraLogs(): Promise<Contato[]> {
  const res = await fetch("https://bot.odontoexcellencerecife.com.br/webhook/vera-logs");
  if (!res.ok) throw new Error("Erro ao carregar conversas");
  const data = await res.json();
  return data.contatos ?? [];
}

function ContactSkeleton() {
  return (
    <div className="px-4 py-3 border-b space-y-2">
      <div className="flex items-center justify-between"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-16" /></div>
      <Skeleton className="h-3 w-48" />
    </div>
  );
}

export default function ConversasVera() {
  const { role } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: contatos = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["vera-logs"],
    queryFn: fetchVeraLogs,
    refetchOnWindowFocus: false,
  });

  if (role !== "admin" && role !== "socio") {
    return <p className="text-muted-foreground p-4">Acesso restrito.</p>;
  }

  const filtered = contatos.filter((c) => !searchTerm || (c.nome || c.session_id).toLowerCase().includes(searchTerm.toLowerCase()) || c.session_id.includes(searchTerm));
  const selected = contatos.find((c) => c.session_id === selectedId) ?? null;

  return (
    <div className="flex flex-1 min-h-0 border rounded-lg overflow-hidden bg-background h-full">
      <div className={cn("w-full md:w-80 md:min-w-[20rem] border-r flex flex-col", selected ? "hidden md:flex" : "flex")}>
        <div className="p-3 border-b space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground font-medium">{filtered.length} contato{filtered.length !== 1 && "s"}</span>
            <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar contato..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {isLoading && Array.from({ length: 6 }).map((_, i) => <ContactSkeleton key={i} />)}
          {!isLoading && filtered.length === 0 && <p className="p-4 text-sm text-muted-foreground">Nenhuma conversa encontrada.</p>}
          {filtered.map((c) => (
            <button key={c.session_id} onClick={() => setSelectedId(c.session_id)} className={cn("w-full text-left px-4 py-3 border-b hover:bg-muted/50 transition-colors", selectedId === c.session_id && "bg-muted")}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm truncate">{c.nome || c.session_id}</span>
                <span className="text-[11px] text-muted-foreground ml-2 shrink-0">{formatTimestamp(c.updated_at)}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{c.ultima_mensagem}</p>
            </button>
          ))}
        </ScrollArea>
      </div>

      <div className={cn("flex-1 flex flex-col", !selected ? "hidden md:flex" : "flex")}>
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <MessageCircle className="h-8 w-8 mr-2 opacity-40" /><span>Selecione uma conversa</span>
          </div>
        ) : (
          <>
            <div className="p-3 border-b flex items-center gap-2">
              <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setSelectedId(null)}><ArrowLeft className="h-4 w-4" /></Button>
              <span className="font-medium text-sm">{selected.nome || selected.session_id}</span>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="flex flex-col gap-2 max-w-2xl mx-auto">
                {selected.mensagens.map((m, i) => {
                  const isHuman = m.tipo === "human";
                  const content = isHuman ? m.conteudo : parseAiContent(m.conteudo);
                  if (!content) return null;
                  return (
                    <div key={i} className={cn("flex", isHuman ? "justify-end" : "justify-start")}>
                      <div className={cn("rounded-xl px-3 py-2 max-w-[75%] text-sm whitespace-pre-wrap", isHuman ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm")}>
                        {content}
                        <div className={cn("text-[10px] mt-1 opacity-70", isHuman ? "text-right" : "text-left")}>{formatTimestamp(m.timestamp)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  );
}
