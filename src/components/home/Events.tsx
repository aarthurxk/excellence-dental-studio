import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { trackSectionClick } from "@/hooks/useSectionTracking";

const Events = () => {
  const { data: events, isLoading } = useQuery({
    queryKey: ["events_preview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("active", true)
        .order("event_date")
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  return (
    <section className="py-12 md:py-20 bg-background">
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
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card p-8 rounded-2xl border border-border">
                  <Skeleton className="h-4 w-32 mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-12 w-full mb-4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))
            : events?.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-card p-8 rounded-2xl border border-border hover:shadow-lg hover:border-primary/20 transition-all group"
                >
                  {event.image_url && (
                    <div className="mb-4 -mx-8 -mt-8 overflow-hidden rounded-t-2xl">
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-primary text-sm font-medium mb-4">
                    <Calendar className="h-4 w-4" />
                    {format(parseISO(event.event_date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
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
          <Button asChild variant="outline" size="lg" className="font-semibold" onClick={() => trackSectionClick("eventos")}>
            <Link to="/eventos">Ver todos os eventos</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Events;
