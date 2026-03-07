import Layout from "@/components/layout/Layout";
import { Calendar, MapPin } from "lucide-react";

const events = [
  { title: "Semana do Sorriso", description: "Avaliações gratuitas e descontos especiais em clareamento dental.", date: "15 de Março, 2026", location: "Odonto Excellence – Ipsep" },
  { title: "Palestra: Saúde Bucal Infantil", description: "Dicas e orientações para cuidar dos dentes das crianças desde cedo.", date: "22 de Março, 2026", location: "Odonto Excellence – Ipsep" },
  { title: "Mutirão de Implantes", description: "Condições especiais para tratamento com implantes dentários.", date: "05 de Abril, 2026", location: "Odonto Excellence – Ipsep" },
  { title: "Workshop de Higiene Bucal", description: "Aprenda técnicas corretas de escovação e uso do fio dental.", date: "20 de Abril, 2026", location: "Odonto Excellence – Ipsep" },
];

const EventsPage = () => {
  return (
    <Layout>
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-14">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Eventos</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-3">
              Nossos <span className="text-primary">Eventos</span>
            </h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {events.map((e) => (
              <div key={e.title} className="bg-card p-8 rounded-2xl border border-border hover:shadow-lg transition-all">
                <div className="flex items-center gap-2 text-primary text-sm font-medium mb-4">
                  <Calendar className="h-4 w-4" />
                  {e.date}
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">{e.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{e.description}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {e.location}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default EventsPage;
