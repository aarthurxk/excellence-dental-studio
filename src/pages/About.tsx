import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle } from "lucide-react";

const AboutPage = () => {
  return (
    <Layout>
      <section className="py-20 bg-background">
        <div className="container max-w-4xl">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Sobre Nós</span>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-3 mb-8">
            Odonto Excellence – <span className="text-primary">Unidade Ipsep</span>
          </h1>
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              A Odonto Excellence é uma rede de clínicas odontológicas comprometida com a excelência no atendimento 
              e na qualidade dos tratamentos. Nossa unidade no Ipsep, Recife, oferece um ambiente moderno e acolhedor, 
              equipado com tecnologia de última geração.
            </p>
            <p>
              Com uma equipe de profissionais altamente qualificados e especializados em diversas áreas da odontologia, 
              estamos preparados para atender desde procedimentos preventivos até os tratamentos mais complexos.
            </p>
            <p>
              Nossa missão é transformar sorrisos com segurança, conforto e resultados excepcionais. 
              Acreditamos que cada paciente merece um atendimento personalizado e humanizado.
            </p>
          </div>
          <div className="mt-10">
            <Button size="lg" asChild className="font-semibold">
              <a
                href="https://wa.me/5581991360132?text=Olá! Gostaria de saber mais sobre a clínica."
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Fale Conosco
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
