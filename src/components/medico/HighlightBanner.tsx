import { motion } from "framer-motion";
import { Clock, ShieldCheck } from "lucide-react";

const items = [
  { icon: Clock, text: "Não fechamos para o almoço — Atendemos até 19h", iconClass: "text-primary" },
  { icon: ShieldCheck, text: "Agende sua Avaliação — Novos pacientes são bem-vindos", iconClass: "text-green-400" },
];

const HighlightBanner = () => (
  <section className="bg-secondary">
    <div className="container">
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-secondary-foreground/20">
        {items.map((item, i) => {
          const parts = item.text.split("—");
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              className="flex items-center justify-center gap-3 py-5 px-6"
            >
              <item.icon className={`h-5 w-5 md:h-7 md:w-7 flex-shrink-0 ${item.iconClass}`} strokeWidth={2} />
              <span className="text-sm md:text-xl text-secondary-foreground tracking-wide">
                <strong className="font-bold">{parts[0].trim()}</strong>
                {parts[1] && (
                  <span className="font-normal text-secondary-foreground/70 text-base"> — {parts[1].trim()}</span>
                )}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

export default HighlightBanner;
