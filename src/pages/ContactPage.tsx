import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";

const ContactPage = () => {
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
              <form className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Nome</label>
                  <Input placeholder="Seu nome completo" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Telefone</label>
                  <Input placeholder="(81) 99999-9999" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">E-mail</label>
                  <Input type="email" placeholder="seu@email.com" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Mensagem</label>
                  <Textarea placeholder="Como podemos ajudar?" rows={4} />
                </div>
                <Button type="submit" size="lg" className="w-full font-semibold">
                  Enviar Mensagem
                </Button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">Ou entre em contato diretamente:</p>
                <Button asChild variant="outline" size="lg" className="font-semibold">
                  <a
                    href="https://wa.me/5581991360132?text=Olá! Gostaria de mais informações."
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
                  <p className="text-muted-foreground text-sm">Rua Exemplo, 123 – Ipsep, Recife – PE</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-clinic-red-light flex items-center justify-center shrink-0">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-1">Telefone</h3>
                  <p className="text-muted-foreground text-sm">(81) 99136-0132</p>
                  <p className="text-muted-foreground text-sm">(81) 3299-3019</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-clinic-red-light flex items-center justify-center shrink-0">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-1">E-mail</h3>
                  <p className="text-muted-foreground text-sm">contato@odontoexcellence.com.br</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-clinic-red-light flex items-center justify-center shrink-0">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-1">Horários</h3>
                  <p className="text-muted-foreground text-sm">Seg a Sex: 8h – 18h</p>
                  <p className="text-muted-foreground text-sm">Sáb: 8h – 12h</p>
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden border border-border aspect-video">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3950.5!2d-34.92!3d-8.1!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOMKwMDYnMDAuMCJTIDM0wrA1NScxMi4wIlc!5e0!3m2!1spt-BR!2sbr!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Localização"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;
