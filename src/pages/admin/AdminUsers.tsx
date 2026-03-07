import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState } from "react";
import { Plus, Trash2, UserPlus } from "lucide-react";
import FormDialog from "@/components/admin/FormDialog";
import { useModulePermission } from "@/hooks/usePermissions";
import { Constants } from "@/integrations/supabase/types";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  socio: "Sócio",
  gerente: "Gerente",
  dentista: "Dentista",
  recepcionista: "Recepcionista",
  user: "Usuário",
};

export default function AdminUsers() {
  const qc = useQueryClient();
  const perm = useModulePermission("users");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<AppRole>("recepcionista");

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["admin_user_roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const createUser = useMutation({
    mutationFn: async () => {
      // Use edge function to create user + assign role
      const { data, error } = await supabase.functions.invoke("create-user", {
        body: { email: newEmail, password: newPassword, role: newRole },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_user_roles"] });
      toast.success("Usuário criado!");
      setDialogOpen(false);
      setNewEmail("");
      setNewPassword("");
      setNewRole("recepcionista");
    },
    onError: (e) => toast.error(e.message || "Erro ao criar usuário"),
  });

  const removeRole = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_roles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_user_roles"] });
      toast.success("Papel removido!");
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: AppRole }) => {
      const { error } = await supabase.from("user_roles").update({ role }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_user_roles"] });
      toast.success("Papel atualizado!");
    },
  });

  if (isLoading) return <div className="text-muted-foreground">Carregando...</div>;

  const assignableRoles = Constants.public.Enums.app_role.filter((r) => r !== "user");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold">Usuários & Papéis</h2>
        {perm.can_edit && (
          <Button onClick={() => setDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" /> Novo Usuário
          </Button>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User ID</TableHead>
            <TableHead>Papel</TableHead>
            <TableHead>Criado em</TableHead>
            {perm.can_delete && <TableHead className="w-20">Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-mono text-xs">{r.user_id.slice(0, 8)}...</TableCell>
              <TableCell>
                {perm.can_edit ? (
                  <Select value={r.role} onValueChange={(v) => updateRole.mutate({ id: r.id, role: v as AppRole })}>
                    <SelectTrigger className="w-40 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {assignableRoles.map((role) => (
                        <SelectItem key={role} value={role}>{ROLE_LABELS[role] ?? role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="secondary">{ROLE_LABELS[r.role] ?? r.role}</Badge>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(r.created_at).toLocaleDateString("pt-BR")}
              </TableCell>
              {perm.can_delete && (
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeRole.mutate(r.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <FormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Criar Novo Usuário">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); createUser.mutate(); }}>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Senha</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
          </div>
          <div className="space-y-2">
            <Label>Papel</Label>
            <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {assignableRoles.map((role) => (
                  <SelectItem key={role} value={role}>{ROLE_LABELS[role] ?? role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={createUser.isPending}>
            {createUser.isPending ? "Criando..." : "Criar Usuário"}
          </Button>
        </form>
      </FormDialog>
    </div>
  );
}
