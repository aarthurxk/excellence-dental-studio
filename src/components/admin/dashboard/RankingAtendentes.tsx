import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";
import { useAgentPresence } from "@/hooks/useAgentPresence";

interface RankEntry {
  email: string;
  count: number;
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

const MEDAL: Record<number, string> = { 0: "🥇", 1: "🥈", 2: "🥉" };

export function RankingAtendentes() {
  const { presences } = useAgentPresence();

  // Ranking: leads agendados ou atendidos por atendente
  const { data = [], isLoading } = useQuery({
    queryKey: ["ranking-atendentes"],
    queryFn: async (): Promise<RankEntry[]> => {
      // Agrupa leads por email do atendente via vera_audit_log (ações de agendamento)
      const { data, error } = await supabase
        .from("vera_audit_log")
        .select("user_email")
        .eq("acao", "insert")
        .eq("tabela", "appointments")
        .not("user_email", "is", null);
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const row of data ?? []) {
        if (row.user_email) counts[row.user_email] = (counts[row.user_email] ?? 0) + 1;
      }
      return Object.entries(counts)
        .map(([email, count]) => ({ email, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    },
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-2">
        Nenhum agendamento registrado ainda.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {data.map((entry, i) => {
        const agentEntry = Object.values(presences).find((p) => p.email === entry.email);
        const avatarUrl = agentEntry?.avatarUrl;
        return (
          <div
            key={entry.email}
            className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 bg-card"
          >
            <span className="text-base w-5 text-center shrink-0">{MEDAL[i] ?? `#${i + 1}`}</span>
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarImage src={avatarUrl} alt={entry.email} />
              <AvatarFallback className="text-[10px] bg-muted">
                {initials(entry.email)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm truncate flex-1">{entry.email}</span>
            <Badge variant="secondary" className="tabular-nums text-xs shrink-0">
              {entry.count}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}
