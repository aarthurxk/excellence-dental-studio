import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageCircle, Star, Users } from "lucide-react";
import { useSiteSettings, getWhatsAppUrl } from "@/hooks/useSiteSettings";

const HeroSection = () => {
  const { data: settings } = useSiteSettings();

  return (
    <section className="relative min-h-[600px] bg-secondary">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={settings?.hero_bg_image || "https://placehold.co/1920x700/1a1a1a/1a1a1a"}
          alt=""
          className="w-full h-full object-cover opacity-40"
        />
      </div>

      <div className="container relative z-10 flex items-center min-h-[600px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full">
          {/* Left text */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 py-20"
          >
            <h1 className="text-4xl md:text-5xl lg:text-[52px] font-bold leading-tight text-primary-foreground">
              {settings?.hero_title || "Seu Sorriso Merece Excelência"}
            </h1>

            <p className="text-primary-foreground/70 text-base md:text-lg leading-relaxed max-w-lg">
              {settings?.hero_subtitle || "Tecnologia de ponta, equipe especializada e atendimento humanizado para transformar o seu sorriso."}
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <Button size="lg" className="rounded font-semibold text-sm px-8 py-6" asChild>
                <a href={getWhatsAppUrl(settings?.whatsapp_number || "5581991360132", settings?.whatsapp_message)} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  AGENDAR AGORA
                </a>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="rounded font-semibold text-sm px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <a href="#tratamentos">TRATAMENTOS</a>
              </Button>
            </motion.div>

            {/* Social proof badges */}
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-primary-foreground text-sm font-medium">4.9 no Google</span>
              </div>
              <div className="flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-primary-foreground text-sm font-medium">+500 pacientes</span>
              </div>
            </div>
          </motion.div>

          {/* Right doctor image */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block absolute bottom-0 right-0 z-10"
          >
            <img
              src={settings?.hero_doctor_image || "https://placehold.co/500x600/1a1a1a/cccccc?text=Dentista"}
              alt="Profissional"
              className="h-[550px] object-contain object-top"
            />
          </motion.div>
        </div>
      </div>

      {/* Bottom teal bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-primary" />
    </section>
  );
};

export default HeroSection;
