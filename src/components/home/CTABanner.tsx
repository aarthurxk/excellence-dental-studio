import { Button } from "@/components/ui/button";
import { MessageCircle, Phone } from "lucide-react";

const CTABanner = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
      <div className="container text-center space-y-8">
        <h2 className="text-3xl md:text-4xl font-display font-bold">
          Agende sua avaliação hoje mesmo
        </h2>
        <p className="text-primary-foreground/80 max-w-xl mx-auto text-lg">
          Dê o primeiro passo para transformar o seu sorriso. Nossa equipe está pronta para atendê-lo.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold px-8 py-6 text-base">
            <a
              href="https://wa.me/5581991360132?text=Olá! Gostaria de agendar uma consulta."
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              WhatsApp
            </a>
          </Button>
          <Button size="lg" variant="outline" asChild className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-semibold px-8 py-6 text-base">
            <a href="tel:8132993019">
              <Phone className="h-5 w-5 mr-2" />
              (81) 3299-3019
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
