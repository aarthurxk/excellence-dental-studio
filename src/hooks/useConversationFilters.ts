import * as React from "react";
import { useSearchParams } from "react-router-dom";

export interface ConversationFilters {
  search: string;
  tagIds: string[];
  status: string;
  agentId: string;
  dateFrom: string;
  dateTo: string;
}

const DEFAULTS: ConversationFilters = {
  search: "",
  tagIds: [],
  status: "",
  agentId: "",
  dateFrom: "",
  dateTo: "",
};

function serializeTags(ids: string[]) {
  return ids.join(",");
}

function deserializeTags(raw: string | null): string[] {
  if (!raw) return [];
  return raw.split(",").filter(Boolean);
}

/**
 * Gerencia filtros de conversas persistidos via URL (useSearchParams).
 * Isso permite bookmarking e compartilhamento do estado de filtros.
 */
export function useConversationFilters() {
  const [params, setParams] = useSearchParams();

  const filters: ConversationFilters = React.useMemo(() => ({
    search: params.get("q") ?? DEFAULTS.search,
    tagIds: deserializeTags(params.get("tags")),
    status: params.get("status") ?? DEFAULTS.status,
    agentId: params.get("agent") ?? DEFAULTS.agentId,
    dateFrom: params.get("from") ?? DEFAULTS.dateFrom,
    dateTo: params.get("to") ?? DEFAULTS.dateTo,
  }), [params]);

  const setFilter = React.useCallback(
    <K extends keyof ConversationFilters>(key: K, value: ConversationFilters[K]) => {
      setParams((prev) => {
        const next = new URLSearchParams(prev);
        const paramKey = key === "search" ? "q" : key === "tagIds" ? "tags" : key === "agentId" ? "agent" : key === "dateFrom" ? "from" : key === "dateTo" ? "to" : key;

        if (Array.isArray(value)) {
          const str = serializeTags(value as string[]);
          if (str) next.set(paramKey, str);
          else next.delete(paramKey);
        } else {
          if (value) next.set(paramKey, value as string);
          else next.delete(paramKey);
        }
        return next;
      }, { replace: true });
    },
    [setParams],
  );

  const clearFilters = React.useCallback(() => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      ["q", "tags", "status", "agent", "from", "to"].forEach((k) => next.delete(k));
      return next;
    }, { replace: true });
  }, [setParams]);

  const hasActiveFilters = React.useMemo(
    () =>
      filters.search !== "" ||
      filters.tagIds.length > 0 ||
      filters.status !== "" ||
      filters.agentId !== "" ||
      filters.dateFrom !== "" ||
      filters.dateTo !== "",
    [filters],
  );

  /**
   * Aplica os filtros localmente a uma lista de itens.
   * Útil para filtragem client-side enquanto não há query backend.
   */
  function applyLocal<T extends { id: string; displayName?: string; phone?: string; status?: string | null; tags?: { id: string }[] }>(
    items: T[],
  ): T[] {
    return items.filter((item) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const nameMatch = (item.displayName ?? "").toLowerCase().includes(q);
        const phoneMatch = (item.phone ?? "").includes(q);
        if (!nameMatch && !phoneMatch) return false;
      }
      if (filters.tagIds.length > 0) {
        const itemTagIds = (item.tags ?? []).map((t) => t.id);
        if (!filters.tagIds.some((id) => itemTagIds.includes(id))) return false;
      }
      if (filters.status && item.status !== filters.status) return false;
      return true;
    });
  }

  return { filters, setFilter, clearFilters, hasActiveFilters, applyLocal };
}
