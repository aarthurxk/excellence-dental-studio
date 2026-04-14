import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Bot, Clock, MessageSquare, Save, Power } from "lucide-react";

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface VeraConfig {
  id: string;
  ai_enabled: boolean;
  system_prompt: string | null;
  greeting_message: string | null;
  away_message: string | null;
  working_hours_start: string | null;
  working_hours_end: string | null;
  working_days: number[] | null;
}

export default function AdminVeraConfig() {
  const { role } = useAuth();
  const [config, setConfig] = useState<VeraConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    const { data, error } = await supabase
      .from("vera_config")
      .select("*")
      .eq("id", "main")
      .maybeSingle();

    if (error) {
      toast.error("Erro ao carregar configurações");
    } else if (data) {
      setConfig(data as VeraConfig);
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    const { error } = await supabase
      .from("vera_config")
      .update({
        ai_enabled: config.ai_enabled,
        system_prompt: config.system_prompt,
        greeting_message: config.greeting_message,
        away_message: config.away_message,
        working_hours_start: config.working_hours_start,
        working_hours_end: config.working_hours_end,
        working_days: config.working_days,
      })
      .eq("id", "main");

    if (error) {
      toast.error("Erro ao salvar");
    } else {
      toast.success("Configurações salvas!");
    }
    setSaving(false);
  }

  function toggleDay(day: number) {
    if (!config) return;
    const days = config.working_days ?? [];
    const next = days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort();
    setConfig({ ...config, working_days: next });
  }

  if (role !== "admin" && role !== "socio") {
    return <p className="text-muted-foreground">Acesso restrito.</p>;
  }

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;
  if (!config) return <p className="text-destructive">Configuração não encontrada.</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Bot className="h-6 w-6" /> Configuração IA Vera</h2>
          <p className="text-muted-foreground text-sm">Gerencie o comportamento da assistente virtual</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" /> {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      {/* Global toggle */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Power className="h-4 w-4" /> Status Global</CardTitle>
          <CardDescription>Ativar ou desativar a Vera para todos os contatos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Switch checked={config.ai_enabled} onCheckedChange={(v) => setConfig({ ...config, ai_enabled: v })} />
            <span className={config.ai_enabled ? "text-green-600 font-medium" : "text-muted-foreground"}>
              {config.ai_enabled ? "IA Ativa" : "IA Desativada"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Working hours */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Horário de Atendimento</CardTitle>
          <CardDescription>Fora desse horário, a Vera envia a mensagem de ausência</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="space-y-1">
              <Label>Início</Label>
              <Input type="time" value={config.working_hours_start ?? "08:00"} onChange={(e) => setConfig({ ...config, working_hours_start: e.target.value })} className="w-32" />
            </div>
            <div className="space-y-1">
              <Label>Fim</Label>
              <Input type="time" value={config.working_hours_end ?? "20:00"} onChange={(e) => setConfig({ ...config, working_hours_end: e.target.value })} className="w-32" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Dias de atendimento</Label>
            <div className="flex gap-2 flex-wrap">
              {DAY_LABELS.map((label, i) => (
                <label key={i} className="flex items-center gap-1.5 cursor-pointer select-none">
                  <Checkbox checked={(config.working_days ?? []).includes(i)} onCheckedChange={() => toggleDay(i)} />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Mensagens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Mensagem de boas-vindas</Label>
            <Textarea value={config.greeting_message ?? ""} onChange={(e) => setConfig({ ...config, greeting_message: e.target.value })} rows={3} />
          </div>
          <div className="space-y-1">
            <Label>Mensagem fora do horário</Label>
            <Textarea value={config.away_message ?? ""} onChange={(e) => setConfig({ ...config, away_message: e.target.value })} rows={3} />
          </div>
        </CardContent>
      </Card>

      {/* System prompt */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Bot className="h-4 w-4" /> Prompt do Sistema</CardTitle>
          <CardDescription>Instruções que definem a personalidade e comportamento da Vera</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea value={config.system_prompt ?? ""} onChange={(e) => setConfig({ ...config, system_prompt: e.target.value })} rows={12} className="font-mono text-xs" />
          <p className="text-xs text-muted-foreground mt-2 text-right">
            {(config.system_prompt ?? "").length.toLocaleString()} caracteres
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
