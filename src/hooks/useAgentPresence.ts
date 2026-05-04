import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { AgentPresenceStatus } from "@/components/admin/cards/AgentLiveCard";

export interface AgentPresenceEntry {
  agentId: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  status: AgentPresenceStatus;
  onlineSince?: string;
}

const CHANNEL = "admin-presence";

/**
 * Rastreia presença em tempo real dos usuários admin via Supabase Realtime.
 * Cada aba autenticada entra no canal e anuncia seu estado.
 * Retorna mapa { userId: AgentPresenceEntry }.
 */
export function useAgentPresence() {
  const { user } = useAuth();
  const [presences, setPresences] = React.useState<Record<string, AgentPresenceEntry>>({});

  React.useEffect(() => {
    if (!user) return;

    // Nome único por mount evita reuso de canal já subscrito (erro Supabase Realtime)
    const channelName = `${CHANNEL}-${user.id.slice(0, 8)}-${Date.now()}`;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    try {
      channel = supabase.channel(channelName, {
        config: { presence: { key: user.id } },
      });

      const myState: Omit<AgentPresenceEntry, "status"> = {
        agentId: user.id,
        email: user.email ?? "",
        displayName: user.user_metadata?.full_name ?? user.email ?? "",
        avatarUrl: user.user_metadata?.avatar_url ?? undefined,
        onlineSince: new Date().toISOString(),
      };

      channel
        .on("presence", { event: "sync" }, () => {
          if (!channel) return;
          try {
            const state = channel.presenceState<Omit<AgentPresenceEntry, "status">>();
            const next: Record<string, AgentPresenceEntry> = {};
            for (const [key, presArr] of Object.entries(state)) {
              const pres = presArr[0];
              if (!pres) continue;
              next[key] = {
                agentId: key,
                email: (pres as any).email ?? "",
                displayName: (pres as any).displayName,
                avatarUrl: (pres as any).avatarUrl,
                onlineSince: (pres as any).onlineSince,
                status: "online",
              };
            }
            setPresences(next);
          } catch { /* ignora erros de sync */ }
        })
        .on("presence", { event: "leave" }, ({ leftPresences }) => {
          setPresences((prev) => {
            const next = { ...prev };
            for (const p of leftPresences as any[]) {
              if (next[p.key]) next[p.key] = { ...next[p.key], status: "offline" };
            }
            return next;
          });
        });

      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED" && channel) {
          try { await channel.track(myState); } catch { /* WebSocket pode não estar pronto */ }
        }
      });
    } catch {
      /* Realtime indisponível — presença desabilitada silenciosamente */
    }

    return () => {
      if (channel) supabase.removeChannel(channel).catch(() => {});
    };
  }, [user]);

  /** Lista ordenada: online primeiro, depois away, offline por último */
  const sorted = React.useMemo(() => {
    const order: Record<AgentPresenceStatus, number> = { online: 0, away: 1, offline: 2 };
    return Object.values(presences).sort(
      (a, b) => order[a.status] - order[b.status],
    );
  }, [presences]);

  return { presences, sorted };
}
