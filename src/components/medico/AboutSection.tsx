import { motion } from "framer-motion";
import { ArrowRight, Calendar, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SectionDivider from "./SectionDivider";
import { getWhatsAppUrl, useSiteSettings } from "@/hooks/useSiteSettings";

const AboutSection = () => {
  const { data: settings } = useSiteSettings();
  const { data } = useQuery({
    queryKey: ["about_content"],
    queryFn: async () => {
      const { data, error } = await supabase.from("about_content").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const bullets = [
    "Tecnologia de ponta com equipamentos de última geração.",
    "Equipe multidisciplinar altamente qualificada.",
    "Atendimento humanizado e personalizado para cada paciente.",
    "Ambiente acolhedor e confortável para toda a família.",
    "Sem fila de espera – Agendamento direto pelo WhatsApp.",
  ];
  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <img
                src={settings?.about_image || "https://placehold.co/600x450/fef2f2/dc2626?text=Odonto+Excellence"}
                alt="Clínica Odonto Excellence"
                className="w-full rounded-lg shadow-card object-cover aspect-[4/3]"
                onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/600x450/fef2f2/dc2626?text=Odonto+Excellence"; }}
              />
              {/* Badge: inline on mobile, absolute on desktop */}
              <div className="hidden lg:block absolute -bottom-5 -right-5 bg-primary text-primary-foreground rounded-lg p-5 shadow-hover text-center">
                <p className="text-3xl font-bold font-display">{data?.stat_years || "10+"}</p>
                <p className="text-xs font-medium">anos de experiência</p>
              </div>
            </div>
            <div className="lg:hidden mt-4 flex justify-center">
              <div className="bg-primary text-primary-foreground rounded-lg px-6 py-3 shadow-hover text-center inline-flex items-center gap-3">
                <p className="text-2xl font-bold font-display">{data?.stat_years || "10+"}</p>
                <p className="text-xs font-medium">anos de<br />experiência</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-5"
          >
            <h2 className="text-2xl md:text-4xl font-bold text-foreground">
              {data?.title || "Odonto Excellence"}
            </h2>
            <SectionDivider />
            <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
              {data?.paragraph_1 || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer adipiscing erat eget risus sollicitudin pellentesque et non erat. Maecenas nibh dolor, malesuada et bibendum a, sagittis accumsan ipsum."}
            </p>
            {data?.paragraph_2 && (
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{data.paragraph_2}</p>
            )}

            <ul className="space-y-3">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3 text-muted-foreground text-sm md:text-base">
                  <ArrowRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-3 gap-4 py-6 border-y border-border mt-4">
              {[
                { value: data?.stat_patients || "1500+", label: "Pacientes" },
                { value: data?.stat_treatments || "15+", label: "Especialidades" },
                { value: data?.stat_years || "10+", label: "Anos" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <p className="text-xl md:text-2xl font-bold text-primary font-display">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button size="lg" className="rounded font-semibold px-8 w-full sm:w-auto" asChild>
                <a href={getWhatsAppUrl(settings?.whatsapp_number || "5581991360132", settings?.whatsapp_message)} target="_blank" rel="noopener noreferrer">
                  <Calendar className="h-4 w-4 mr-2" />
                  AGENDAR
                </a>
              </Button>
              <Button size="lg" variant="outline" className="rounded font-semibold px-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground w-full sm:w-auto" asChild>
                <Link to="/sobre">
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  SAIBA MAIS
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
