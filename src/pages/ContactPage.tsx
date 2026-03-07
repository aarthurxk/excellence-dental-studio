import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { useSiteSettings, getWhatsAppUrl } from "@/hooks/useSiteSettings";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const contactSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(200),
  phone: z.string().optional().default(""),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")).default(""),
  message: z.string().min(1, "Mensagem é obrigatória").max(2000),
});

type ContactForm = z.infer<typeof contactSchema>;

const ContactPage = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (values: ContactForm) => {
    setSubmitting(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: values.name,
      phone: values.phone || "",
      email: values.email || "",
      message: values.message,
    });
    setSubmitting(false);

    if (error) {
      toast({ title: "Erro ao enviar", description: "Tente novamente mais tarde.", variant: "destructive" });
    } else {
      toast({ title: "Mensagem enviada!", description: "Entraremos em contato em breve." });
      reset();
    }
  };

  return (
    <Layout>
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-14">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Contato</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-3">
              Fale <span className="text-primary">Conosco</span>
            </h1>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div>
              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Nome</label>
                  <Input placeholder="Seu nome completo" {...register("name")} />
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Telefone</label>
                  <Input placeholder="(81) 99999-9999" {...register("phone")} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">E-mail</label>
                  <Input type="email" placeholder="seu@email.com" {...register("email")} />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Mensagem</label>
                  <Textarea placeholder="Como podemos ajudar?" rows={4} {...register("message")} />
                  {errors.message && <p className="text-xs text-destructive mt-1">{errors.message.message}</p>}
                </div>
                <Button type="submit" size="lg" className="w-full font-semibold" disabled={submitting}>
                  {submitting ? "Enviando..." : "Enviar Mensagem"}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">Ou entre em contato diretamente:</p>
                <Button asChild variant="outline" size="lg" className="font-semibold">
                  <a
                    href={getWhatsAppUrl(settings?.whatsapp_number || "5581991360132", settings?.whatsapp_message)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    WhatsApp
                  </a>
                </Button>
              </div>
            </div>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-clinic-red-light flex items-center justify-center shrink-0">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-1">Endereço</h3>
                  {isLoading ? <Skeleton className="h-4 w-48" /> : (
                    <p className="text-muted-foreground text-sm">{settings?.address}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-clinic-red-light flex items-center justify-center shrink-0">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-1">Telefone</h3>
                  {isLoading ? <Skeleton className="h-4 w-32" /> : (
                    <>
                      <p className="text-muted-foreground text-sm">{settings?.phone}</p>
                      {settings?.phone_secondary && <p className="text-muted-foreground text-sm">{settings.phone_secondary}</p>}
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-clinic-red-light flex items-center justify-center shrink-0">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-1">E-mail</h3>
                  {isLoading ? <Skeleton className="h-4 w-48" /> : (
                    <p className="text-muted-foreground text-sm">{settings?.email}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-clinic-red-light flex items-center justify-center shrink-0">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-1">Horários</h3>
                  {isLoading ? <Skeleton className="h-4 w-40" /> : (
                    <>
                      <p className="text-muted-foreground text-sm">{settings?.hours_weekday}</p>
                      {settings?.hours_saturday && <p className="text-muted-foreground text-sm">{settings.hours_saturday}</p>}
                    </>
                  )}
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden border border-border aspect-video">
                {settings?.google_maps_embed_url ? (
                  <iframe
                    src={settings.google_maps_embed_url}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title="Localização"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm bg-muted">
                    Mapa em breve
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;
