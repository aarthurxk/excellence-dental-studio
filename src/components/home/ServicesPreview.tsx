import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Smile, Sparkles, Stethoscope, Syringe, ScanFace, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  { icon: Smile, title: "Implantes Dentários", description: "Recupere seu sorriso com implantes de alta qualidade e durabilidade." },
  { icon: Sparkles, title: "Clareamento Dental", description: "Dentes mais brancos com técnicas seguras e resultados imediatos." },
  { icon: Stethoscope, title: "Ortodontia", description: "Aparelhos convencionais e alinhadores invisíveis para todos os casos." },
  { icon: ScanFace, title: "Harmonização Facial", description: "Procedimentos estéticos para valorizar seu sorriso e rosto." },
  { icon: Syringe, title: "Endodontia", description: "Tratamento de canal com tecnologia avançada e sem dor." },
  { icon: ShieldCheck, title: "Prevenção", description: "Limpeza, check-up e acompanhamento para manter a saúde bucal." },
];

const ServicesPreview = () => {
  return (
    <section id="tratamentos" className="py-20 bg-clinic-gray">
      <div className="container">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Nossos <span className="text-primary">Tratamentos</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Oferecemos uma ampla gama de tratamentos odontológicos para cuidar do seu sorriso de forma completa.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-card p-8 rounded-2xl border border-border hover:shadow-lg hover:border-primary/20 transition-all duration-300 group"
            >
              <div className="h-12 w-12 rounded-lg bg-clinic-red-light flex items-center justify-center mb-5 group-hover:bg-primary transition-colors">
                <service.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">{service.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Button asChild variant="outline" size="lg" className="font-semibold">
            <Link to="/tratamentos">
              Ver todos os tratamentos
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesPreview;
