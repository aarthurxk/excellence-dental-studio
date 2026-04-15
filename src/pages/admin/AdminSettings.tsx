import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import type { Tables } from "@/integrations/supabase/types";
import ImageUpload from "@/components/admin/ImageUpload";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Bot } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, MessageSquare, Save, Power } from "lucide-react";

type SettingsData = Tables<"site_settings">;

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface VeraConfig {
  id: string; ai_enabled: boolean; system_prompt: string | null; greeting_message: string | null;
  away_message: string | null; working_hours_start: string | null; working_hours_end: string | null; working_days: number[] | null;
}

function SiteSettingsTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin_settings"],
    queryFn: async () => { const { data, error } = await supabase.from("site_settings").select("*").limit(1).maybeSingle(); if (error) throw error; return data; },
  });

  const [form, setForm] = useState({
    hero_title: "", hero_subtitle: "", phone: "", phone_secondary: "", email: "",
    address: "", hours_weekday: "", hours_saturday: "", whatsapp_number: "",
    whatsapp_message: "", instagram_url: "", facebook_url: "", google_maps_embed_url: "",
    hero_bg_image: "", hero_doctor_image: "", about_image: "", chat_enabled: true,
  });

  useEffect(() => {
    if (data) setForm({
      hero_title: data.hero_title, hero_subtitle: data.hero_subtitle,
      phone: data.phone, phone_secondary: data.phone_secondary ?? "",
      email: data.email, address: data.address,
      hours_weekday: data.hours_weekday, hours_saturday: data.hours_saturday ?? "",
      whatsapp_number: data.whatsapp_number, whatsapp_message: data.whatsapp_message ?? "",
      instagram_url: data.instagram_url ?? "", facebook_url: data.facebook_url ?? "",
      google_maps_embed_url: data.google_maps_embed_url ?? "",
      hero_bg_image: data.hero_bg_image ?? "", hero_doctor_image: data.hero_doctor_image ?? "",
      about_image: data.about_image ?? "", chat_enabled: data.chat_enabled ?? true,
    });
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      if (data?.id) { const { error } = await supabase.from("site_settings").update(form).eq("id", data.id); if (error) throw error; }
      else { const { error } = await supabase.from("site_settings").insert(form); if (error) throw error; }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_settings"] }); qc.invalidateQueries({ queryKey: ["site_settings"] }); toast.success("Salvo!"); },
    onError: () => toast.error("Erro ao salvar"),
  });

  if (isLoading) return <div className="text-muted-foreground">Carregando...</div>;

  return (
    <form className="space-y-4 max-w-2xl" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
      <fieldset className="space-y-4 border rounded-lg p-4">
        <legend className="text-sm font-semibold px-2">Hero</legend>
        <div className="space-y-2"><Label>Título</Label><Input value={form.hero_title} onChange={(e) => setForm({ ...form, hero_title: e.target.value })} /></div>
        <div className="space-y-2"><Label>Subtítulo</Label><Input value={form.hero_subtitle} onChange={(e) => setForm({ ...form, hero_subtitle: e.target.value })} /></div>
        <div className="space-y-2"><Label>Imagem de Fundo</Label><ImageUpload bucket="clinic-images" folder="hero" value={form.hero_bg_image} onChange={(url) => setForm({ ...form, hero_bg_image: url })} /></div>
        <div className="space-y-2"><Label>Foto do Dentista</Label><ImageUpload bucket="clinic-images" folder="hero" value={form.hero_doctor_image} onChange={(url) => setForm({ ...form, hero_doctor_image: url })} /></div>
      </fieldset>
      <fieldset className="space-y-4 border rounded-lg p-4">
        <legend className="text-sm font-semibold px-2">Sobre (Imagem)</legend>
        <div className="space-y-2"><Label>Foto da Clínica</Label><ImageUpload bucket="clinic-images" folder="about" value={form.about_image} onChange={(url) => setForm({ ...form, about_image: url })} /></div>
      </fieldset>
      <fieldset className="space-y-4 border rounded-lg p-4">
        <legend className="text-sm font-semibold px-2">Contato</legend>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Telefone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="space-y-2"><Label>Telefone Secundário</Label><Input value={form.phone_secondary} onChange={(e) => setForm({ ...form, phone_secondary: e.target.value })} /></div>
        </div>
        <div className="space-y-2"><Label>E-mail</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div className="space-y-2"><Label>Endereço</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
      </fieldset>
      <fieldset className="space-y-4 border rounded-lg p-4">
        <legend className="text-sm font-semibold px-2">Horários</legend>
        <div className="space-y-2"><Label>Seg a Sex</Label><Input value={form.hours_weekday} onChange={(e) => setForm({ ...form, hours_weekday: e.target.value })} /></div>
        <div className="space-y-2"><Label>Sábado</Label><Input value={form.hours_saturday} onChange={(e) => setForm({ ...form, hours_saturday: e.target.value })} /></div>
      </fieldset>
      <fieldset className="space-y-4 border rounded-lg p-4">
        <legend className="text-sm font-semibold px-2">WhatsApp</legend>
        <div className="space-y-2"><Label>Número (com DDI)</Label><Input value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} /></div>
        <div className="space-y-2"><Label>Mensagem padrão</Label><Textarea value={form.whatsapp_message} onChange={(e) => setForm({ ...form, whatsapp_message: e.target.value })} /></div>
      </fieldset>
      <fieldset className="space-y-4 border rounded-lg p-4">
        <legend className="text-sm font-semibold px-2">Redes Sociais</legend>
        <div className="space-y-2"><Label>Instagram URL</Label><Input value={form.instagram_url} onChange={(e) => setForm({ ...form, instagram_url: e.target.value })} /></div>
        <div className="space-y-2"><Label>Facebook URL</Label><Input value={form.facebook_url} onChange={(e) => setForm({ ...form, facebook_url: e.target.value })} /></div>
      </fieldset>
      <fieldset className="space-y-4 border rounded-lg p-4">
        <legend className="text-sm font-semibold px-2">Mapa</legend>
        <div className="space-y-2"><Label>Google Maps Embed URL</Label><Input value={form.google_maps_embed_url} onChange={(e) => setForm({ ...form, google_maps_embed_url: e.target.value })} /></div>
      </fieldset>
      <fieldset className="space-y-4 border rounded-lg p-4">
        <legend className="text-sm font-semibold px-2">Assistente Virtual</legend>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5"><Label>Vera (Chat)</Label><p className="text-xs text-muted-foreground">Ativar o botão vermelho de chat no site</p></div>
          <Switch checked={form.chat_enabled} onCheckedChange={(checked) => setForm({ ...form, chat_enabled: checked })} />
        </div>
      </fieldset>
      <Button type="submit" disabled={save.isPending}>{save.isPending ? "Salvando..." : "Salvar"}</Button>
    </form>
  );
}

function VeraConfigTab() {
  const { role } = useAuth();
  const [config, setConfig] = useState<VeraConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchConfig(); }, []);

  async function fetchConfig() {
    const { data, error } = await supabase.from("vera_config").select("*").eq("id", "main").maybeSingle();
    if (error) toast.error("Erro ao carregar configurações");
    else if (data) setConfig(data as VeraConfig);
    setLoading(false);
  }

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    const { error } = await supabase.from("vera_config").update({
      ai_enabled: config.ai_enabled, system_prompt: config.system_prompt, greeting_message: config.greeting_message,
      away_message: config.away_message, working_hours_start: config.working_hours_start, working_hours_end: config.working_hours_end, working_days: config.working_days,
    }).eq("id", "main");
    if (error) toast.error("Erro ao salvar"); else toast.success("Configurações salvas!");
    setSaving(false);
  }

  function toggleDay(day: number) {
    if (!config) return;
    const days = config.working_days ?? [];
    setConfig({ ...config, working_days: days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort() });
  }

  if (role !== "admin" && role !== "socio") return <p className="text-muted-foreground">Acesso restrito.</p>;
  if (loading) return <p className="text-muted-foreground">Carregando...</p>;
  if (!config) return <p className="text-destructive">Configuração não encontrada.</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}><Save className="h-4 w-4 mr-2" /> {saving ? "Salvando..." : "Salvar"}</Button>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Power className="h-4 w-4" /> Status Global</CardTitle><CardDescription>Ativar ou desativar a Vera para todos os contatos</CardDescription></CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Switch checked={config.ai_enabled} onCheckedChange={(v) => setConfig({ ...config, ai_enabled: v })} />
            <span className={config.ai_enabled ? "text-green-600 font-medium" : "text-muted-foreground"}>{config.ai_enabled ? "IA Ativa" : "IA Desativada"}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Horário de Atendimento</CardTitle><CardDescription>Fora desse horário, a Vera envia a mensagem de ausência</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="space-y-1"><Label>Início</Label><Input type="time" value={config.working_hours_start ?? "08:00"} onChange={(e) => setConfig({ ...config, working_hours_start: e.target.value })} className="w-32" /></div>
            <div className="space-y-1"><Label>Fim</Label><Input type="time" value={config.working_hours_end ?? "20:00"} onChange={(e) => setConfig({ ...config, working_hours_end: e.target.value })} className="w-32" /></div>
          </div>
          <div className="space-y-2">
            <Label>Dias de atendimento</Label>
            <div className="flex gap-2 flex-wrap">
              {DAY_LABELS.map((label, i) => (
                <label key={i} className="flex items-center gap-1.5 cursor-pointer select-none">
                  <Checkbox checked={(config.working_days ?? []).includes(i)} onCheckedChange={() => toggleDay(i)} /><span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Mensagens</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1"><Label>Mensagem de boas-vindas</Label><Textarea value={config.greeting_message ?? ""} onChange={(e) => setConfig({ ...config, greeting_message: e.target.value })} rows={3} /></div>
          <div className="space-y-1"><Label>Mensagem fora do horário</Label><Textarea value={config.away_message ?? ""} onChange={(e) => setConfig({ ...config, away_message: e.target.value })} rows={3} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Bot className="h-4 w-4" /> Prompt do Sistema</CardTitle><CardDescription>Instruções que definem a personalidade e comportamento da Vera</CardDescription></CardHeader>
        <CardContent>
          <Textarea value={config.system_prompt ?? ""} onChange={(e) => setConfig({ ...config, system_prompt: e.target.value })} rows={12} className="font-mono text-xs" />
          <p className="text-xs text-muted-foreground mt-2 text-right">{(config.system_prompt ?? "").length.toLocaleString()} caracteres</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminSettings() {
  const { role } = useAuth();
  const showVeraTab = role === "admin" || role === "socio";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold">Configurações</h2>
      <Tabs defaultValue="site">
        <TabsList className="w-fit">
          <TabsTrigger value="site" className="gap-1.5"><Settings className="h-4 w-4" /> Site</TabsTrigger>
          {showVeraTab && <TabsTrigger value="ia-vera" className="gap-1.5"><Bot className="h-4 w-4" /> IA Vera</TabsTrigger>}
        </TabsList>
        <TabsContent value="site" className="mt-4"><SiteSettingsTab /></TabsContent>
        {showVeraTab && <TabsContent value="ia-vera" className="mt-4"><VeraConfigTab /></TabsContent>}
      </Tabs>
    </div>
  );
}
