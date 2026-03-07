import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Calendar, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const EventsPage = () => {
  const { data: events, isLoading } = useQuery({
    queryKey: ["events_all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("active", true)
        .order("event_date");
      if (error) throw error;
      return data;
    },
  });

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
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-card p-8 rounded-2xl border border-border">
                    <Skeleton className="h-4 w-32 mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-3" />
                    <Skeleton className="h-12 w-full mb-4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))
              : events?.map((e) => (
                  <div key={e.id} className="bg-card p-8 rounded-2xl border border-border hover:shadow-lg transition-all">
                    <div className="flex items-center gap-2 text-primary text-sm font-medium mb-4">
                      <Calendar className="h-4 w-4" />
                      {format(parseISO(e.event_date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
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
