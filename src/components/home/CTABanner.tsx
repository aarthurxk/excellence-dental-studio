import { Button } from "@/components/ui/button";
import { MessageCircle, Phone } from "lucide-react";
import { useSiteSettings, getWhatsAppUrl } from "@/hooks/useSiteSettings";

const CTABanner = () => {
  const { data: settings } = useSiteSettings();

  const whatsappUrl = getWhatsAppUrl(
    settings?.whatsapp_number || "5581991360132",
    settings?.whatsapp_message
  );
  const phoneSecondary = settings?.phone_secondary || "(81) 3299-3019";
  const phoneDigits = phoneSecondary.replace(/\D/g, "");

  return (
    <section className="relative py-20 bg-primary text-primary-foreground overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/5 pointer-events-none" />

      <div className="container relative z-10 text-center space-y-8">
        <div>
          <span className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            Vagas disponíveis esta semana
          </span>
        </div>

        <h2 className="text-3xl md:text-4xl font-display font-bold">
          Agende sua avaliação hoje mesmo
        </h2>
        <p className="text-primary-foreground/80 max-w-xl mx-auto text-lg">
          Dê o primeiro passo para transformar o seu sorriso. Nossa equipe está pronta para atendê-lo.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="bg-[#25D366] hover:bg-[#22c55e] text-white font-bold px-8 py-6 text-base shadow-hover">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5 mr-2" />
              WhatsApp
            </a>
          </Button>
          <Button size="lg" variant="outline" asChild className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-semibold px-8 py-6 text-base">
            <a href={`tel:${phoneDigits}`}>
              <Phone className="h-5 w-5 mr-2" />
              {phoneSecondary}
            </a>
          </Button>
        </div>

        <p className="text-primary-foreground/60 text-sm mt-4">
          ✓ Sem compromisso &nbsp;·&nbsp; ✓ Avaliação gratuita &nbsp;·&nbsp; ✓ Atendimento humanizado
        </p>
      </div>
    </section>
  );
};

export default CTABanner;
