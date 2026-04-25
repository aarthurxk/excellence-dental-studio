import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LeadTag {
  id: string;
  name: string;
  color: string;
}

export interface LeadTagAssignment {
  id: string;
  lead_id: string;
  tag_id: string;
}

// Catálogo completo de etiquetas
export function useTags() {
  return useQuery({
    queryKey: ["lead-tags"],
    queryFn: async (): Promise<LeadTag[]> => {
      const { data, error } = await supabase
        .from("lead_tags")
        .select("*")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

// Etiquetas atribuídas a um lead específico
export function useLeadTags(leadId: string | null | undefined) {
  return useQuery({
    queryKey: ["lead-tag-assignments", leadId],
    queryFn: async (): Promise<LeadTag[]> => {
      if (!leadId) return [];
      const { data, error } = await supabase
        .from("lead_tag_assignments")
        .select("tag:lead_tags(*)")
        .eq("lead_id", leadId);
      if (error) throw error;
      return (data ?? []).map((row: any) => row.tag).filter(Boolean);
    },
    enabled: !!leadId,
  });
}

// Mapa { lead_id: LeadTag[] } para uma lista de leads (uma única query)
export function useLeadTagsMap(leadIds: string[]) {
  return useQuery({
    queryKey: ["lead-tags-map", leadIds.sort().join(",")],
    queryFn: async (): Promise<Record<string, LeadTag[]>> => {
      if (leadIds.length === 0) return {};
      const { data, error } = await supabase
        .from("lead_tag_assignments")
        .select("lead_id, tag:lead_tags(*)")
        .in("lead_id", leadIds);
      if (error) throw error;
      const map: Record<string, LeadTag[]> = {};
      for (const row of (data ?? []) as any[]) {
        if (!row.tag) continue;
        if (!map[row.lead_id]) map[row.lead_id] = [];
        map[row.lead_id].push(row.tag);
      }
      return map;
    },
    enabled: leadIds.length > 0,
  });
}

export function useTagMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["lead-tags"] });
    qc.invalidateQueries({ queryKey: ["lead-tag-assignments"] });
    qc.invalidateQueries({ queryKey: ["lead-tags-map"] });
  };

  const createTag = useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) => {
      const { data, error } = await supabase
        .from("lead_tags")
        .insert({ name, color })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });

  const updateTag = useMutation({
    mutationFn: async ({ id, name, color }: { id: string; name?: string; color?: string }) => {
      const { error } = await supabase
        .from("lead_tags")
        .update({ ...(name !== undefined && { name }), ...(color !== undefined && { color }) })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteTag = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lead_tags").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const assignTag = useMutation({
    mutationFn: async ({ leadId, tagId }: { leadId: string; tagId: string }) => {
      const { error } = await supabase
        .from("lead_tag_assignments")
        .insert({ lead_id: leadId, tag_id: tagId });
      if (error && !error.message.includes("duplicate")) throw error;
    },
    onSuccess: invalidate,
  });

  const unassignTag = useMutation({
    mutationFn: async ({ leadId, tagId }: { leadId: string; tagId: string }) => {
      const { error } = await supabase
        .from("lead_tag_assignments")
        .delete()
        .eq("lead_id", leadId)
        .eq("tag_id", tagId);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { createTag, updateTag, deleteTag, assignTag, unassignTag };
}

// Helper: cor do texto baseado em luminância para legibilidade
export function getReadableTextColor(hex: string): string {
  const c = hex.replace("#", "");
  if (c.length !== 6) return "#fff";
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#1f2937" : "#ffffff";
}
