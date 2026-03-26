import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SectionDivider from "./SectionDivider";

const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const TestimonialCard = ({ t, i }: { t: typeof items[0]; i: number }) => (
    <div className="bg-card p-6 md:p-8 rounded-xl shadow-card hover:shadow-hover transition-shadow duration-300 relative border border-border/50 min-w-[85vw] sm:min-w-0 snap-center">
      <Quote className="absolute top-4 right-4 h-6 w-6 md:h-8 md:w-8 text-primary/15" />
      <div className="flex gap-1 mb-4">
        {[...Array(t.rating)].map((_, j) => (
          <Star key={j} className="h-4 w-4 fill-primary text-primary" />
        ))}
      </div>
      <p className="text-muted-foreground leading-relaxed mb-6 italic text-sm md:text-base">"{t.text}"</p>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
          {t.patient_name.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-foreground text-sm">{t.patient_name}</p>
          <p className="text-xs text-green-600 font-medium">Paciente Verificado ✓</p>
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-12 md:py-20 bg-mint-bg">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-14"
        >
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-3">Depoimentos</h2>
          <div className="flex justify-center items-center gap-2 mt-3 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 md:h-5 md:w-5 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="font-bold text-foreground ml-1 text-sm md:text-base">4.9</span>
            <span className="text-muted-foreground text-xs md:text-sm">/ 5.0 — Google Reviews</span>
          </div>
          <div className="flex justify-center"><SectionDivider /></div>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4 text-sm md:text-base">
            Veja o que nossos pacientes falam sobre nossa clínica.
          </p>
        </motion.div>

        {/* Mobile: horizontal scroll-snap carousel */}
        <div className="md:hidden">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {items.map((t, i) => (
              <TestimonialCard key={t.id} t={t} i={i} />
            ))}
          </div>
          {/* Dots indicator */}
          {items.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-4">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    scrollRef.current?.children[i]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                  }}
                  className="h-2 w-2 rounded-full bg-primary/30 hover:bg-primary transition-colors"
                  aria-label={`Ir para depoimento ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Desktop: grid with pagination */}
        <div className="hidden md:block">
          <div className="grid grid-cols-3 gap-8 mb-8">
            {visible.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <TestimonialCard t={t} i={i} />
              </motion.div>
            ))}
          </div>

          {items.length > 3 && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                onClick={() => setCurrent(Math.max(0, current - 3))}
                disabled={current === 0}
                className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm text-muted-foreground">
                {Math.floor(current / 3) + 1} / {Math.ceil(items.length / 3)}
              </span>
              <button
                onClick={() => setCurrent(Math.min(items.length - 1, current + 3))}
                disabled={current + 3 >= items.length}
                className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to="/depoimentos" className="text-primary text-sm font-semibold hover:underline inline-flex items-center gap-1 min-h-[44px]">
            Ver todos os depoimentos <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
