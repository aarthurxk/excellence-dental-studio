import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteSettings, getWhatsAppUrl } from "@/hooks/useSiteSettings";

const cases = [
  {
    title: "Clareamento a Laser",
    before: "https://placehold.co/600x400/d1d5db/6b7280?text=Antes",
    after: "https://placehold.co/600x400/fef2f2/dc2626?text=Depois",
    detail: "Resultado em 1 sessão",
  },
  {
    title: "Facetas de Porcelana",
    before: "https://placehold.co/600x400/d1d5db/6b7280?text=Antes",
    after: "https://placehold.co/600x400/fef2f2/dc2626?text=Depois",
    detail: "Transformação completa",
  },
  {
    title: "Implante Dentário",
    before: "https://placehold.co/600x400/d1d5db/6b7280?text=Antes",
    after: "https://placehold.co/600x400/fef2f2/dc2626?text=Depois",
    detail: "Sorriso restaurado",
  },
];

const SliderCard = ({ c }: { c: typeof cases[0] }) => {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = Math.min(Math.max(((clientX - rect.left) / rect.width) * 100, 5), 95);
    setPos(x);
  };

  return (
    <div className="rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-shadow duration-300 bg-card border border-border/50">
      <div
        ref={ref}
        className="relative aspect-[3/2] cursor-col-resize select-none overflow-hidden"
        onMouseMove={(e) => e.buttons === 1 && handleMove(e.clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      >
        {/* After image (base) */}
        <img src={c.after} alt={`${c.title} — Depois`} className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        {/* Before image (clipped) */}
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
          <img src={c.before} alt={`${c.title} — Antes`} className="absolute inset-0 w-full h-full object-cover" style={{ minWidth: `${(100 / pos) * 100}%`, maxWidth: `${(100 / pos) * 100}%` }} draggable={false} />
        </div>
        {/* Divider */}
        <div className="absolute top-0 bottom-0 z-10" style={{ left: `${pos}%`, transform: "translateX(-50%)" }}>
          <div className="w-0.5 h-full bg-white/90" />
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-white shadow-lg flex items-center justify-center text-foreground text-xs font-bold">
            ⟺
          </div>
        </div>
        {/* Labels */}
        <span className="absolute top-3 left-3 bg-foreground/70 text-background text-xs font-bold px-2.5 py-1 rounded-full z-10">ANTES</span>
        <span className="absolute top-3 right-3 bg-primary/90 text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full z-10">DEPOIS</span>
      </div>
      <div className="p-5 text-center">
        <h3 className="font-display font-bold text-foreground">{c.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{c.detail}</p>
      </div>
    </div>
  );
};

const BeforeAfter = () => {
  const { data: settings } = useSiteSettings();
  const whatsappUrl = getWhatsAppUrl(settings?.whatsapp_number || "5581991360132", settings?.whatsapp_message);

  return (
    <section className="py-20 bg-muted/20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
            Resultados Reais
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Antes e Depois
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Arraste o divisor para ver a transformação. Resultados reais de pacientes reais.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cases.map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <SliderCard c={c} />
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button size="lg" className="font-bold px-8" style={{ backgroundColor: "#25D366" }} asChild>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5 mr-2" /> Quero esse resultado!
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BeforeAfter;
