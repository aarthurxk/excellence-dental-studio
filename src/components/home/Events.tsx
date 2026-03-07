import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const events = [
  {
    title: "Semana do Sorriso",
    description: "Avaliações gratuitas e descontos especiais em clareamento dental.",
    date: "15 de Março, 2026",
    location: "Odonto Excellence – Ipsep",
  },
  {
    title: "Palestra: Saúde Bucal Infantil",
    description: "Dicas e orientações para cuidar dos dentes das crianças desde cedo.",
    date: "22 de Março, 2026",
    location: "Odonto Excellence – Ipsep",
  },
  {
    title: "Mutirão de Implantes",
    description: "Condições especiais para tratamento com implantes dentários.",
    date: "05 de Abril, 2026",
    location: "Odonto Excellence – Ipsep",
  },
];

const Events = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Próximos <span className="text-primary">Eventos</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Fique por dentro dos nossos eventos e promoções especiais.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {events.map((event, i) => (
            <motion.div
              key={event.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card p-8 rounded-2xl border border-border hover:shadow-lg hover:border-primary/20 transition-all group"
            >
              <div className="flex items-center gap-2 text-primary text-sm font-medium mb-4">
                <Calendar className="h-4 w-4" />
                {event.date}
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">{event.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{event.description}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {event.location}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Button asChild variant="outline" size="lg" className="font-semibold">
            <Link to="/eventos">Ver todos os eventos</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Events;
