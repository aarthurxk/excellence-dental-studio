import { Circle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAgentPresence } from "@/hooks/useAgentPresence";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export function AtendentesOnline() {
  const { sorted } = useAgentPresence();
  const online = sorted.filter((a) => a.status !== "offline");

  if (online.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Online agora
        </span>
        <div className="flex items-center -space-x-2">
          {online.slice(0, 8).map((agent) => (
            <Tooltip key={agent.agentId}>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Avatar className="h-7 w-7 ring-2 ring-background cursor-default">
                    <AvatarImage src={agent.avatarUrl} alt={agent.displayName} />
                    <AvatarFallback className="text-[10px] bg-muted">
                      {initials(agent.displayName || agent.email)}
                    </AvatarFallback>
                  </Avatar>
                  <Circle
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 fill-current",
                      agent.status === "online" ? "text-emerald-500" : "text-amber-500",
                    )}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {agent.displayName || agent.email}
              </TooltipContent>
            </Tooltip>
          ))}
          {online.length > 8 && (
            <div className="h-7 w-7 rounded-full bg-muted ring-2 ring-background flex items-center justify-center text-[10px] font-medium text-muted-foreground">
              +{online.length - 8}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
