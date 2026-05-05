import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FormDialog from "@/components/admin/FormDialog";
import { Constants } from "@/integrations/supabase/types";
import type { Database } from "@/integrations/supabase/types";
import { Wand2 } from "lucide-react";

type AppRole = Database["public"]["Enums"]["app_role"];

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  socio: "Sócio",
  gerente: "Gerente",
  dentista: "Dentista",
  recepcionista: "Recepcionista",
  secretaria: "Secretaria",
  agencia: "Agência",
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: "Acesso total ao sistema",
  socio: "Acesso total (equivalente a Admin)",
  gerente: "Gerencia conteúdo e operação, sem usuários/configs",
  secretaria: "Atendimento WhatsApp, leads e mensagens do site",
  recepcionista: "Mensagens do site e visualização",
  dentista: "Visualização e edição de tratamentos",
  agencia: "Somente leitura de Analytics",
};

export interface UserFormValues {
  email: string;
  password?: string;
  full_name: string;
  phone: string;
  job_title: string;
  department: string;
  role: AppRole;
  notes: string;
  active: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  initial?: Partial<UserFormValues> & { user_id?: string };
  onSubmit: (values: UserFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
  mode: "create" | "edit";
}

function generatePassword() {
  const chars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$";
  return Array.from({ length: 14 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function UserFormDialog({ open, onClose, initial, onSubmit, isSubmitting, mode }: Props) {
  const [values, setValues] = useState<UserFormValues>({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    job_title: "",
    department: "",
    role: "secretaria",
    notes: "",
    active: true,
  });

  useEffect(() => {
    if (open) {
      setValues({
        email: initial?.email ?? "",
        password: "",
        full_name: initial?.full_name ?? "",
        phone: initial?.phone ?? "",
        job_title: initial?.job_title ?? "",
        department: initial?.department ?? "",
        role: (initial?.role as AppRole) ?? "secretaria",
        notes: initial?.notes ?? "",
        active: initial?.active ?? true,
      });
    }
  }, [open, initial]);

  const assignableRoles = Constants.public.Enums.app_role.filter((r) => r !== "user");

  function update<K extends keyof UserFormValues>(key: K, val: UserFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  return (
    <FormDialog open={open} onClose={onClose} title={mode === "create" ? "Novo Usuário" : "Editar Usuário"}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(values);
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Nome completo</Label>
            <Input value={values.full_name} onChange={(e) => update("full_name", e.target.value)} placeholder="Maria Silva" />
          </div>
          <div className="space-y-1.5">
            <Label>Telefone</Label>
            <Input value={values.phone} onChange={(e) => update("phone", e.target.value)} placeholder="(81) 99999-0000" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>E-mail *</Label>
          <Input
            type="email"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            required
            disabled={mode === "edit"}
          />
        </div>

        {mode === "create" && (
          <div className="space-y-1.5">
            <Label>Senha *</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={values.password}
                onChange={(e) => update("password", e.target.value)}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
              />
              <Button type="button" variant="outline" size="icon" onClick={() => update("password", generatePassword())} title="Gerar senha forte">
                <Wand2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Cargo</Label>
            <Input value={values.job_title} onChange={(e) => update("job_title", e.target.value)} placeholder="Ex: Recepcionista turno manhã" />
          </div>
          <div className="space-y-1.5">
            <Label>Setor</Label>
            <Input value={values.department} onChange={(e) => update("department", e.target.value)} placeholder="Ex: Atendimento" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Papel *</Label>
          <Select value={values.role} onValueChange={(v) => update("role", v as AppRole)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {assignableRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {ROLE_LABELS[role] ?? role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[values.role] ?? ""}</p>
        </div>

        <div className="space-y-1.5">
          <Label>Anotações internas</Label>
          <Textarea value={values.notes} onChange={(e) => update("notes", e.target.value)} rows={2} placeholder="Visível apenas para Admins" />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : mode === "create" ? "Criar Usuário" : "Salvar"}
          </Button>
        </div>
      </form>
    </FormDialog>
  );
}
