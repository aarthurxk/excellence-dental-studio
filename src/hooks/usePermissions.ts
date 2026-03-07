import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Permission {
  can_view: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

const NO_PERMISSION: Permission = { can_view: false, can_edit: false, can_delete: false };

export function usePermissions(module?: string) {
  const { role } = useAuth();

  const { data: permissions } = useQuery({
    queryKey: ["role_permissions", role],
    queryFn: async () => {
      if (!role) return {};
      const { data, error } = await supabase
        .from("role_permissions")
        .select("module, can_view, can_edit, can_delete")
        .eq("role", role);
      if (error) throw error;
      const map: Record<string, Permission> = {};
      data?.forEach((p) => {
        map[p.module] = { can_view: p.can_view ?? false, can_edit: p.can_edit ?? false, can_delete: p.can_delete ?? false };
      });
      return map;
    },
    enabled: !!role,
    staleTime: 5 * 60 * 1000,
  });

  const allPermissions = permissions ?? {};

  if (module) {
    return allPermissions[module] ?? NO_PERMISSION;
  }

  return allPermissions;
}

export function useModulePermission(module: string): Permission {
  return usePermissions(module) as Permission;
}
