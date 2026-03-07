import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary/10 to-clinic-gray overflow-hidden">
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                  <p className="text-sm">Foto da clínica</p>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground rounded-2xl p-6 shadow-xl">
                <p className="text-3xl font-bold font-display">10+</p>
                <p className="text-sm">anos de experiência</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Sobre a Clínica</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground leading-tight">
              Excelência e cuidado em cada <span className="text-primary">detalhe</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              A Odonto Excellence – Unidade Ipsep é referência em odontologia na região metropolitana do Recife. 
              Com infraestrutura moderna e uma equipe de profissionais altamente qualificados, oferecemos 
              tratamentos completos que aliam tecnologia de ponta a um atendimento humanizado.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Nossa missão é proporcionar saúde bucal com conforto e segurança, 
              transformando sorrisos e a autoestima dos nossos pacientes.
            </p>
            <Button asChild size="lg" className="font-semibold">
              <Link to="/sobre">
                Conheça nossa história
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
