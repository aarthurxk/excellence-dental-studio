import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const dentists = [
  { name: "Dr. João Silva", specialty: "Implantodontia", cro: "CRO-PE 12345" },
  { name: "Dra. Maria Santos", specialty: "Ortodontia", cro: "CRO-PE 67890" },
  { name: "Dr. Carlos Oliveira", specialty: "Endodontia", cro: "CRO-PE 11223" },
  { name: "Dra. Ana Costa", specialty: "Harmonização Facial", cro: "CRO-PE 44556" },
];

const Team = () => {
  return (
    <section className="py-20 bg-clinic-gray">
      <div className="container">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Nossa <span className="text-primary">Equipe</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Profissionais dedicados e especializados prontos para cuidar do seu sorriso.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {dentists.map((dentist, i) => (
            <motion.div
              key={dentist.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-all group"
            >
              <div className="aspect-[3/4] bg-gradient-to-br from-primary/5 to-clinic-gray flex items-center justify-center">
                <p className="text-xs text-muted-foreground">Foto</p>
              </div>
              <div className="p-6 text-center">
                <h3 className="font-display text-lg font-semibold text-foreground">{dentist.name}</h3>
                <p className="text-primary text-sm font-medium mt-1">{dentist.specialty}</p>
                <p className="text-xs text-muted-foreground mt-1">{dentist.cro}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Button asChild variant="outline" size="lg" className="font-semibold">
            <Link to="/equipe">
              Conheça toda a equipe
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Team;
