import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SectionDivider from "./SectionDivider";

const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0);

  const { data: testimonials } = useQuery({
    queryKey: ["testimonials_preview"],
    queryFn: async () => {
      const { data, error } = await supabase.from("testimonials").select("*").eq("active", true).order("featured", { ascending: false }).limit(6);
      if (error) throw error;
      return data;
    },
  });

  const items = testimonials || [];
  const visible = items.slice(current, current + 3).length >= 1 ? items.slice(current, current + 3) : items.slice(0, 3);

  return (
    <section className="py-20 bg-mint-bg">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Depoimentos</h2>
          <div className="flex justify-center"><SectionDivider /></div>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
            Veja o que nossos pacientes falam sobre nossa clínica.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {visible.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card p-8 rounded shadow-sm relative"
            >
              <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/15" />
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {t.patient_name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">{t.patient_name}</p>
                  <p className="text-xs text-muted-foreground">Paciente</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {items.length > 3 && (
          <div className="flex justify-center gap-3">
            <Button
              size="sm"
              variant="default"
              onClick={() => setCurrent(Math.max(0, current - 3))}
              disabled={current === 0}
              className="rounded font-semibold"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={() => setCurrent(Math.min(items.length - 1, current + 3))}
              disabled={current + 3 >= items.length}
              className="rounded font-semibold"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
