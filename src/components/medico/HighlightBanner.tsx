import { motion } from "framer-motion";
import { Clock, CheckCircle } from "lucide-react";

const items = [
  { icon: Clock, text: "Não fechamos para o almoço" },
  { icon: CheckCircle, text: "AQUI VOCÊ PODE!" },
];

const HighlightBanner = () => (
  <section className="bg-secondary">
    <div className="container">
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-secondary-foreground/20">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.15 }}
            className="flex items-center justify-center gap-3 py-5 px-6"
          >
            <item.icon className="h-7 w-7 text-primary flex-shrink-0" strokeWidth={2} />
            <span className="text-lg md:text-xl font-bold text-secondary-foreground tracking-wide">
              {item.text}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HighlightBanner;
