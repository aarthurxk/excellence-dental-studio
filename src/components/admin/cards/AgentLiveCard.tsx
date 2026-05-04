import * as React from "react";
import { Circle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ConversationCard, ConversationCardData } from "./ConversationCard";

export type AgentPresenceStatus = "online" | "away" | "offline";

export interface AgentLiveCardData {
  agentId: string;
  displayName: string;
  email: string;
  avatarUrl?: string | null;
  status: AgentPresenceStatus;
  conversations: ConversationCardData[];
}

interface Props {
  agent: AgentLiveCardData;
  onConversationClick?: (conv: ConversationCardData) => void;
  activeConversationId?: string;
  className?: string;
}

const STATUS_CONFIG: Record<AgentPresenceStatus, { label: string; dot: string }> = {
  online: { label: "Online", dot: "text-emerald-500" },
  away: { label: "Ausente", dot: "text-amber-500" },
  offline: { label: "Offline", dot: "text-muted-foreground" },
};

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function AgentLiveCard({ agent, onConversationClick, activeConversationId, className }: Props) {
  const { displayName, email, avatarUrl, status, conversations } = agent;
  const cfg = STATUS_CONFIG[status];

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-border bg-card shadow-soft",
        "min-w-[260px] max-w-[300px] w-72 h-[520px]",
        status === "offline" && "opacity-60",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
        <div className="relative">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl ?? undefined} alt={displayName} />
            <AvatarFallback className="text-xs font-medium bg-muted">
              {initials(displayName || email)}
            </AvatarFallback>
          </Avatar>
          <Circle
            className={cn("absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-current", cfg.dot)}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate leading-tight">{displayName || email}</p>
          <p className="text-[11px] text-muted-foreground">{cfg.label}</p>
        </div>

        <Badge
          variant="secondary"
          className="text-xs tabular-nums shrink-0 h-5 px-1.5"
        >
          {conversations.length}
        </Badge>
      </div>

      {/* Conversations list */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Nenhum atendimento
            </div>
          ) : (
            conversations.map((conv) => (
              <ConversationCard
                key={conv.id}
                data={conv}
                active={conv.id === activeConversationId}
                onClick={() => onConversationClick?.(conv)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
