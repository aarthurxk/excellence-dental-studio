import { motion } from "framer-motion";
import { CalendarDays, PhoneCall, MapPin } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const InfoStrip = () => {
  const { data: settings } = useSiteSettings();

  const items = [
    {
      icon: CalendarDays,
      title: "Horário de Atendimento",
      lines: [
        `Seg – Sex: ${settings?.hours_weekday?.replace("Seg a Sex: ", "") || "8h – 18h"}`,
        `Sábado: ${settings?.hours_saturday?.replace("Sáb: ", "") || "8h – 12h"}`,
      ],
      href: null as string | null,
    },
    {
      icon: PhoneCall,
      title: "Ligue Agora",
      lines: [
        settings?.phone || "(81) 3299-3019",
        settings?.phone_secondary || "(81) 99136-0132",
      ],
      href: `tel:${(settings?.phone || "8132993019").replace(/\D/g, "")}`,
    },
    {
      icon: MapPin,
      title: "Nossa Localização",
      lines: [
        "Rua Jean Emile Favre, 1712",
        "Ipsep, Recife – PE",
      ],
      href: "https://maps.google.com/?q=Odonto+Excellence+Ipsep+Recife",
    },
  ];

  return (
    <section className="relative z-20 bg-primary mt-0 md:-mt-16">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3">
          {items.map((item, i) => {
            const content = (
              <>
                {/* Desktop: centered vertical layout */}
                <div className="hidden md:block">
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
                </div>
                {/* Mobile: compact horizontal layout */}
                <div className="flex md:hidden items-center gap-4">
                  <item.icon className="h-8 w-8 text-primary-foreground flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <h3 className="text-sm font-bold">{item.title}</h3>
                    {item.lines.map((line, j) => (
                      <p key={j} className="text-primary-foreground/80 text-xs">{line}</p>
                    ))}
                  </div>
                </div>
              </>
            );

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className={`py-4 px-4 md:py-10 md:px-8 md:text-center text-primary-foreground ${i < 2 ? "border-b md:border-b-0 md:border-r border-primary-foreground/20" : ""}`}
              >
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="block hover:opacity-80 transition-opacity min-h-[44px] flex items-center md:block"
                  >
                    {content}
                  </a>
                ) : (
                  content
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default InfoStrip;
