import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-clinic-dark via-clinic-dark to-primary/20 text-primary-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(358_82%_50%_/_0.15),_transparent_70%)]" />
      <div className="container relative py-20 md:py-32 lg:py-40">
        <div className="max-w-3xl space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
              Odonto Excellence – Unidade Ipsep
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display leading-tight">
              Seu sorriso merece o{" "}
              <span className="text-primary">melhor</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-primary-foreground/70 max-w-xl leading-relaxed"
          >
            Tecnologia de ponta, equipe especializada e atendimento humanizado para transformar o seu sorriso. Agende sua avaliação.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button size="lg" asChild className="text-base font-semibold px-8 py-6">
              <a
                href="https://wa.me/5581991360132?text=Olá! Gostaria de agendar uma consulta."
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Agendar via WhatsApp
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base font-semibold px-8 py-6 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <a href="#tratamentos">
                Nossos Tratamentos
                <ArrowRight className="h-5 w-5 ml-2" />
              </a>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Decorative shapes */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
