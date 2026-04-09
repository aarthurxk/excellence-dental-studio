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

type Settings = Tables<"site_settings">;

export default function AdminSettings() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState({
    hero_title: "", hero_subtitle: "", phone: "", phone_secondary: "", email: "",
    address: "", hours_weekday: "", hours_saturday: "", whatsapp_number: "",
    whatsapp_message: "", instagram_url: "", facebook_url: "", google_maps_embed_url: "",
    hero_bg_image: "", hero_doctor_image: "", about_image: "",
    chat_enabled: true,
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
      about_image: data.about_image ?? "",
      chat_enabled: data.chat_enabled ?? true,
    });
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      if (data?.id) {
        const { error } = await supabase.from("site_settings").update(form).eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("site_settings").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_settings"] }); qc.invalidateQueries({ queryKey: ["site_settings"] }); toast.success("Salvo!"); },
    onError: () => toast.error("Erro ao salvar"),
  });

  if (isLoading) return <div className="text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-display font-bold">Configurações do Site</h2>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
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
            <div className="space-y-0.5">
              <Label>Vera (Chat)</Label>
              <p className="text-xs text-muted-foreground">Ativar o botão vermelho de chat no site</p>
            </div>
            <Switch checked={form.chat_enabled} onCheckedChange={(checked) => setForm({ ...form, chat_enabled: checked })} />
          </div>
        </fieldset>

        <Button type="submit" disabled={save.isPending}>{save.isPending ? "Salvando..." : "Salvar"}</Button>
      </form>
    </div>
  );
}
