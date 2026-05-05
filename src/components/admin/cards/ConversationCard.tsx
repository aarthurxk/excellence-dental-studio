import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getReadableTextColor } from "@/hooks/useLeadTags";

export interface ConversationTag {
  id: string;
  name: string;
  color: string;
}

export interface ConversationCardData {
  id: string;
  /** Nome de exibição (push_name ou name) */
  displayName: string;
  phone: string;
  avatarUrl?: string | null;
  lastMessage?: string | null;
  lastContactAt?: string | null;
  tags?: ConversationTag[];
  unreadCount?: number;
  /** Minutos desde último contato — usado para SLA visual */
  waitMinutes?: number;
  status?: string | null;
  priority?: number;
}

interface Props {
  data: ConversationCardData;
  onClick?: () => void;
  active?: boolean;
  className?: string;
}

function initials(name: string) {
  const cleaned = (name ?? "").trim();
  if (!cleaned) return "?";
  // Se for só dígitos (telefone), mostra ícone genérico
  if (/^\+?\d[\d\s()-]*$/.test(cleaned)) return "#";
  return cleaned
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function slaColor(minutes: number) {
  if (minutes < 15) return "text-emerald-600 bg-emerald-50";
  if (minutes < 30) return "text-amber-600 bg-amber-50";
  return "text-red-600 bg-red-50";
}

export function ConversationCard({ data, onClick, active, className }: Props) {
  const {
    displayName,
    phone,
    avatarUrl,
    lastMessage,
    lastContactAt,
    tags = [],
    unreadCount = 0,
    waitMinutes,
    priority = 0,
  } = data;

  const timeAgo = lastContactAt
    ? formatDistanceToNow(new Date(lastContactAt), { locale: ptBR, addSuffix: true })
    : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left flex items-start gap-3 rounded-lg border border-border px-3 py-3",
        "hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active && "bg-muted border-primary/30",
        unreadCount > 0 && "border-l-2 border-l-primary",
        className,
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <Avatar className="h-9 w-9">
          <AvatarImage src={avatarUrl ?? undefined} alt={displayName} />
          <AvatarFallback className="text-xs font-medium bg-muted text-muted-foreground">
            {initials(displayName || phone)}
          </AvatarFallback>
        </Avatar>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center px-0.5">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span
            className={cn(
              "text-sm font-medium truncate",
              unreadCount > 0 ? "text-foreground" : "text-foreground/80",
            )}
          >
            {displayName || phone}
          </span>
          {timeAgo && (
            <span className="text-[11px] text-muted-foreground whitespace-nowrap flex items-center gap-1 shrink-0">
              <Clock className="h-3 w-3" />
              {timeAgo}
            </span>
          )}
        </div>

        {/* Last message */}
        {lastMessage && (
          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
            <MessageSquare className="h-3 w-3 shrink-0 opacity-50" />
            {lastMessage}
          </p>
        )}

        {/* Tags + SLA row */}
        {(tags.length > 0 || waitMinutes !== undefined || priority > 0) && (
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {waitMinutes !== undefined && (
              <span
                className={cn(
                  "text-[10px] font-medium rounded px-1.5 py-0.5",
                  slaColor(waitMinutes),
                )}
              >
                {waitMinutes < 60
                  ? `${waitMinutes}min`
                  : `${Math.floor(waitMinutes / 60)}h`}
              </span>
            )}
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="text-[10px] font-medium rounded-full px-2 py-0.5"
                style={{
                  backgroundColor: tag.color,
                  color: getReadableTextColor(tag.color),
                }}
              >
                {tag.name}
              </span>
            ))}
            {tags.length > 3 && (
              <Badge variant="secondary" className="text-[10px] h-4 px-1">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
