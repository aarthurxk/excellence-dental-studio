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
  ];

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
            <img
              src={settings?.about_image || "https://placehold.co/600x450/e2e8f0/94a3b8?text=Clínica"}
              alt="Clínica"
              className="w-full rounded shadow-lg"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-5"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              {data?.title || "Odonto Excellence"}
            </h2>
            <SectionDivider />
            <p className="text-muted-foreground leading-relaxed">
              {data?.paragraph_1 || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer adipiscing erat eget risus sollicitudin pellentesque et non erat. Maecenas nibh dolor, malesuada et bibendum a, sagittis accumsan ipsum."}
            </p>
            {data?.paragraph_2 && (
              <p className="text-muted-foreground leading-relaxed">{data.paragraph_2}</p>
            )}

            <ul className="space-y-3">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3 text-muted-foreground">
                  <ArrowRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button size="lg" className="rounded font-semibold px-8" asChild>
                <a href={getWhatsAppUrl(settings?.whatsapp_number || "5581991360132", settings?.whatsapp_message)} target="_blank" rel="noopener noreferrer">
                  <Calendar className="h-4 w-4 mr-2" />
                  AGENDAR
                </a>
              </Button>
              <Button size="lg" variant="outline" className="rounded font-semibold px-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground" asChild>
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
