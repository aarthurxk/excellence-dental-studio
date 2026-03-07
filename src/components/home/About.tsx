import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const About = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["about_content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("about_content")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

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
                <p className="text-3xl font-bold font-display">{data?.stat_years || "10+"}</p>
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
            {isLoading ? (
              <>
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : (
              <>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground leading-tight">
                  {data?.title || "Excelência e cuidado em cada detalhe"}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {data?.paragraph_1 || "A Odonto Excellence – Unidade Ipsep é referência em odontologia na região metropolitana do Recife."}
                </p>
                {data?.paragraph_2 && (
                  <p className="text-muted-foreground leading-relaxed">{data.paragraph_2}</p>
                )}
              </>
            )}
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
