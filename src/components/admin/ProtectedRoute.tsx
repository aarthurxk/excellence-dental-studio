import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { Loader2 } from "lucide-react";

interface Props {
  children: React.ReactNode;
  /** Se informado, redireciona p/ /admin caso o role não tenha can_view neste módulo */
  module?: string;
  /** Roles com acesso irrestrito (ignoram role_permissions) */
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, module, allowedRoles }: Props) {
  const { user, role, loading } = useAuth();
  const allPerms = usePermissions() as Record<string, { can_view: boolean }>;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !role) return <Navigate to="/admin/login" replace />;

  // Verificação de módulo
  if (module && !allowedRoles?.includes(role)) {
    const perm = allPerms[module];
    if (perm && perm.can_view === false) {
      return <Navigate to="/admin" replace />;
    }
  }

  return <>{children}</>;
}
