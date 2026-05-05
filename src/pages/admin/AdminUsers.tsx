import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useModulePermission } from "@/hooks/usePermissions";
import { Constants } from "@/integrations/supabase/types";
import type { Database } from "@/integrations/supabase/types";
import {
  UserPlus, Search, MoreVertical, KeyRound, Power, Trash2, Pencil, Users as UsersIcon,
  CheckCircle2, XCircle, Filter,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import UserFormDialog, { type UserFormValues } from "@/components/admin/UserFormDialog";

type AppRole = Database["public"]["Enums"]["app_role"];

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  socio: "Sócio",
  gerente: "Gerente",
  dentista: "Dentista",
  recepcionista: "Recepcionista",
  secretaria: "Secretaria",
  agencia: "Agência",
  user: "Usuário",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-primary/15 text-primary border-primary/30",
  socio: "bg-primary/15 text-primary border-primary/30",
  gerente: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  secretaria: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  recepcionista: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30",
  dentista: "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/30",
  agencia: "bg-muted text-muted-foreground border-border",
};

interface UserMeta {
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  banned_until: string | null;
}

interface Profile {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  job_title: string | null;
  department: string | null;
  active: boolean;
  notes: string | null;
  last_login_at: string | null;
}

interface UserRow {
  id: string;
  user_id: string;
  email: string;
  role: AppRole;
  profile: Profile | null;
  meta: UserMeta | null;
}

export default function AdminUsers() {
  const qc = useQueryClient();
  const perm = useModulePermission("users");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<AppRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);

  // Roles
  const { data: roles = [] } = useQuery({
    queryKey: ["admin_user_roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });

  // Profiles
  const { data: profiles = [] } = useQuery({
    queryKey: ["admin_user_profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_profiles").select("*");
      if (error) throw error;
      return data as Profile[];
    },
  });

  // Auth meta (emails, last_sign_in)
  const { data: authData } = useQuery({
    queryKey: ["admin_user_auth"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("list-user-emails");
      if (error) throw error;
      return data as { emails: Record<string, string>; users: Record<string, UserMeta> };
    },
  });

  const rows: UserRow[] = useMemo(() => {
    const profileMap = new Map(profiles.map((p) => [p.user_id, p]));
    return roles.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      role: r.role as AppRole,
      email: authData?.emails?.[r.user_id] ?? r.user_id.slice(0, 8) + "...",
      profile: profileMap.get(r.user_id) ?? null,
      meta: authData?.users?.[r.user_id] ?? null,
    }));
  }, [roles, profiles, authData]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (roleFilter !== "all" && r.role !== roleFilter) return false;
      if (statusFilter === "active" && r.profile?.active === false) return false;
      if (statusFilter === "inactive" && r.profile?.active !== false) return false;
      if (!q) return true;
      return (
        r.email.toLowerCase().includes(q) ||
        (r.profile?.full_name ?? "").toLowerCase().includes(q) ||
        (r.profile?.job_title ?? "").toLowerCase().includes(q) ||
        (r.profile?.department ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, search, roleFilter, statusFilter]);

  const counts = useMemo(() => {
    const c = { total: rows.length, active: 0, inactive: 0 };
    rows.forEach((r) => {
      if (r.profile?.active === false) c.inactive++;
      else c.active++;
    });
    return c;
  }, [rows]);

  // Mutations
  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ["admin_user_roles"] });
    qc.invalidateQueries({ queryKey: ["admin_user_profiles"] });
    qc.invalidateQueries({ queryKey: ["admin_user_auth"] });
  };

  const createUser = useMutation({
    mutationFn: async (values: UserFormValues) => {
      const { data, error } = await supabase.functions.invoke("create-user", { body: values });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => { invalidateAll(); toast.success("Usuário criado!"); setCreateOpen(false); },
    onError: (e: Error) => toast.error(e.message || "Erro ao criar usuário"),
  });

  const updateUser = useMutation({
    mutationFn: async ({ user_id, values }: { user_id: string; values: UserFormValues }) => {
      const { error } = await supabase.functions.invoke("update-user", {
        body: {
          user_id,
          role: values.role,
          profile: {
            full_name: values.full_name,
            phone: values.phone,
            job_title: values.job_title,
            department: values.department,
            notes: values.notes,
          },
        },
      });
      if (error) throw error;
    },
    onSuccess: () => { invalidateAll(); toast.success("Usuário atualizado!"); setEditing(null); },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ user_id, active }: { user_id: string; active: boolean }) => {
      const { error } = await supabase.functions.invoke("update-user", { body: { user_id, active } });
      if (error) throw error;
    },
    onSuccess: (_, vars) => { invalidateAll(); toast.success(vars.active ? "Usuário ativado" : "Usuário desativado"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const resetPassword = useMutation({
    mutationFn: async ({ user_id, password }: { user_id: string; password: string }) => {
      const { error } = await supabase.functions.invoke("update-user", {
        body: { user_id, action: "reset_password", password },
      });
      if (error) throw error;
    },
    onSuccess: () => toast.success("Senha redefinida!"),
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteUser = useMutation({
    mutationFn: async (user_id: string) => {
      const { error } = await supabase.functions.invoke("update-user", {
        body: { user_id, action: "delete_user" },
      });
      if (error) throw error;
    },
    onSuccess: () => { invalidateAll(); toast.success("Usuário removido!"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const assignableRoles = Constants.public.Enums.app_role.filter((r) => r !== "user");

  function initialsOf(name: string | null | undefined, email: string) {
    const src = (name && name.trim()) || email;
    return src.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  }

  function formatLastLogin(profile: Profile | null, meta: UserMeta | null) {
    const ts = profile?.last_login_at ?? meta?.last_sign_in_at;
    if (!ts) return <span className="text-muted-foreground/60">nunca</span>;
    return formatDistanceToNow(new Date(ts), { addSuffix: true, locale: ptBR });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-display font-bold flex items-center gap-2">
            <UsersIcon className="h-6 w-6 text-primary" />
            Usuários & Papéis
          </h2>
          <p className="text-sm text-muted-foreground">
            {counts.total} usuários · {counts.active} ativos · {counts.inactive} inativos
          </p>
        </div>
        {perm.can_edit && (
          <Button onClick={() => setCreateOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" /> Novo Usuário
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, e-mail, cargo ou setor..."
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" /> Status:
          </div>
          {(["all", "active", "inactive"] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={statusFilter === s ? "default" : "outline"}
              onClick={() => setStatusFilter(s)}
              className="h-8"
            >
              {s === "all" ? "Todos" : s === "active" ? "Ativos" : "Inativos"}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button
            size="sm"
            variant={roleFilter === "all" ? "default" : "outline"}
            onClick={() => setRoleFilter("all")}
            className="h-7 text-xs"
          >
            Todos os papéis
          </Button>
          {assignableRoles.map((r) => (
            <Button
              key={r}
              size="sm"
              variant={roleFilter === r ? "default" : "outline"}
              onClick={() => setRoleFilter(r as AppRole)}
              className="h-7 text-xs"
            >
              {ROLE_LABELS[r] ?? r}
            </Button>
          ))}
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead className="hidden md:table-cell">Cargo / Setor</TableHead>
              <TableHead className="hidden lg:table-cell">Último login</TableHead>
              <TableHead>Status</TableHead>
              {perm.can_edit && <TableHead className="w-12" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((r) => {
              const inactive = r.profile?.active === false;
              return (
                <TableRow key={r.id} className={inactive ? "opacity-60" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        {r.profile?.avatar_url && <AvatarImage src={r.profile.avatar_url} />}
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {initialsOf(r.profile?.full_name, r.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{r.profile?.full_name || "—"}</div>
                        <div className="text-xs text-muted-foreground truncate">{r.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={ROLE_COLORS[r.role] ?? ""}>
                      {ROLE_LABELS[r.role] ?? r.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    <div>{r.profile?.job_title || <span className="text-muted-foreground/60">—</span>}</div>
                    <div className="text-xs text-muted-foreground">{r.profile?.department || ""}</div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {formatLastLogin(r.profile, r.meta)}
                  </TableCell>
                  <TableCell>
                    {inactive ? (
                      <Badge variant="outline" className="text-muted-foreground gap-1">
                        <XCircle className="h-3 w-3" /> Inativo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Ativo
                      </Badge>
                    )}
                  </TableCell>
                  {perm.can_edit && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => setEditing(r)}>
                            <Pencil className="h-4 w-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              const pwd = prompt("Nova senha (mínimo 6 caracteres):");
                              if (pwd && pwd.length >= 6) resetPassword.mutate({ user_id: r.user_id, password: pwd });
                            }}
                          >
                            <KeyRound className="h-4 w-4 mr-2" /> Redefinir senha
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleActive.mutate({ user_id: r.user_id, active: inactive })}>
                            <Power className="h-4 w-4 mr-2" /> {inactive ? "Ativar" : "Desativar"}
                          </DropdownMenuItem>
                          {perm.can_delete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  if (confirm(`Remover ${r.email}? Esta ação é irreversível.`)) {
                                    deleteUser.mutate(r.user_id);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Remover
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <UserFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        mode="create"
        isSubmitting={createUser.isPending}
        onSubmit={(v) => createUser.mutate(v)}
      />

      <UserFormDialog
        open={!!editing}
        onClose={() => setEditing(null)}
        mode="edit"
        isSubmitting={updateUser.isPending}
        initial={
          editing
            ? {
                email: editing.email,
                full_name: editing.profile?.full_name ?? "",
                phone: editing.profile?.phone ?? "",
                job_title: editing.profile?.job_title ?? "",
                department: editing.profile?.department ?? "",
                notes: editing.profile?.notes ?? "",
                role: editing.role,
                active: editing.profile?.active ?? true,
              }
            : undefined
        }
        onSubmit={(v) => editing && updateUser.mutate({ user_id: editing.user_id, values: v })}
      />
    </div>
  );
}
