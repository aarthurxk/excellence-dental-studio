import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getIconComponent } from "@/lib/icon-map";
import { Skeleton } from "@/components/ui/skeleton";
import SectionDivider from "./SectionDivider";

const DepartmentsSection = () => {
  const { data: services, isLoading } = useQuery({
    queryKey: ["services_preview"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").eq("active", true).order("display_order").limit(6);
      if (error) throw error;
      return data;
    },
  });

  return (
    <section id="tratamentos" className="py-20 bg-mint-bg">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Nossos Tratamentos</h2>
          <div className="flex justify-center"><SectionDivider /></div>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
            Oferecemos uma ampla gama de tratamentos odontológicos para cuidar do seu sorriso de forma completa.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card p-8 border-l-4 border-primary">
                  <Skeleton className="h-12 w-12 mb-4" />
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-16 w-full" />
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
                    whileHover={{ y: -5, boxShadow: "0 10px 40px -10px hsl(0 83% 51% / 0.3)" }}
                    className="bg-card p-8 border-l-4 border-primary hover:border-l-4 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="mb-5">
                      <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                        <Icon className="h-12 w-12 text-primary" strokeWidth={1.2} />
                      </motion.div>
                    </div>
                    <h3 className="font-bold text-lg text-foreground mb-3">{service.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                  </motion.div>
                );
              })}
        </div>
      </div>
    </section>
  );
};

export default DepartmentsSection;
