import { motion } from "framer-motion";
import { Shield, Heart, Cpu, Users } from "lucide-react";

const features = [
  {
    icon: Cpu,
    title: "Tecnologia de Ponta",
    description: "Equipamentos modernos e técnicas avançadas para os melhores resultados.",
  },
  {
    icon: Heart,
    title: "Atendimento Humanizado",
    description: "Cuidado personalizado para que você se sinta acolhido em cada consulta.",
  },
  {
    icon: Users,
    title: "Equipe Especializada",
    description: "Profissionais com formação e experiência em diversas especialidades.",
  },
  {
    icon: Shield,
    title: "Conforto e Segurança",
    description: "Ambiente confortável com todos os protocolos de biossegurança.",
  },
];

const Features = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Por que escolher a <span className="text-primary">Odonto Excellence</span>?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Combinamos excelência clínica, tecnologia avançada e cuidado humano para oferecer a melhor experiência odontológica.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="h-14 w-14 rounded-xl bg-clinic-red-light flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <feature.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
