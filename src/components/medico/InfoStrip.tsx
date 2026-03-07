import { motion } from "framer-motion";
import { Ambulance, CalendarDays, PhoneCall } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const InfoStrip = () => {
  const { data: settings } = useSiteSettings();

  const items = [
    {
      icon: Ambulance,
      title: "Emergência 24/7",
      lines: ["Casos de emergência:", `Ambulância: ${settings?.phone || "(81) 3299-3019"}`, `Consultório: ${settings?.phone_secondary || "(81) 99136-0132"}`],
    },
    {
      icon: CalendarDays,
      title: "Horário",
      lines: [
        `Segunda – Sexta: ${settings?.hours_weekday || "08:00 – 20:00"}`,
        `Sábado: ${settings?.hours_saturday || "08:00 – 17:00"}`,
        "Domingos e Feriados: 09:00 – 15:00",
      ],
    },
    {
      icon: PhoneCall,
      title: "Central de Atendimento",
      lines: [`Agendamento: ${settings?.phone || "(81) 3299-3019"}`, `Laboratório: ${settings?.phone_secondary || "(81) 99136-0132"}`, `Comercial: ${settings?.phone || "(81) 3299-3019"}`],
    },
  ];

  return (
    <section className="bg-primary">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className={`py-10 px-8 text-center text-primary-foreground ${i < 2 ? "md:border-r md:border-primary-foreground/20" : ""}`}
            >
              <div className="flex justify-center mb-4">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                >
                  <item.icon className="h-12 w-12 text-primary-foreground" strokeWidth={1.5} />
                </motion.div>
              </div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              {item.lines.map((line, j) => (
                <p key={j} className="text-primary-foreground/80 text-sm">{line}</p>
              ))}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InfoStrip;
