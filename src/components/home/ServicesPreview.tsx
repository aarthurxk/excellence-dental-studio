import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getIconComponent } from "@/lib/icon-map";
import { Skeleton } from "@/components/ui/skeleton";
import { trackSectionClick } from "@/hooks/useSectionTracking";

const ServicesPreview = () => {
  const { data: services, isLoading } = useQuery({
    queryKey: ["services_preview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("active", true)
        .order("display_order")
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

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
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card p-8 rounded-2xl border border-border">
                  <Skeleton className="h-12 w-12 rounded-lg mb-5" />
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))
            : services?.map((service, i) => {
                const Icon = getIconComponent(service.icon);
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className="bg-card p-8 rounded-2xl border border-border hover:shadow-lg hover:border-primary/20 transition-all duration-300 group"
                  >
                    <div className="h-12 w-12 rounded-lg bg-clinic-red-light flex items-center justify-center mb-5 group-hover:bg-primary transition-colors">
                      <Icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2">{service.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                  </motion.div>
                );
              })}
        </div>
        <div className="text-center mt-10">
          <Button asChild variant="outline" size="lg" className="font-semibold" onClick={() => trackSectionClick("tratamentos")}>
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
