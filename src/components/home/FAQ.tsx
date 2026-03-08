import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteSettings, getWhatsAppUrl } from "@/hooks/useSiteSettings";

const faqs = [
  { q: "Como faço para agendar uma avaliação?", a: "Agende sua avaliação entrando em contato pelo WhatsApp ou telefone. Nossa equipe responde rapidamente!" },
  { q: "Vocês atendem por plano odontológico?", a: "Nosso atendimento é particular. Entre em contato para conhecer nossas condições de pagamento e facilidades." },
  { q: "Quanto tempo leva um tratamento de clareamento?", a: "O clareamento a laser é feito em uma única sessão de aproximadamente 1 hora. O clareamento com moldeiras caseiras pode levar de 2 a 4 semanas." },
  { q: "Os procedimentos causam dor?", a: "Trabalhamos com anestesia e técnicas modernas para garantir seu conforto. A maioria dos procedimentos é praticamente indolor." },
  { q: "Como faço para agendar uma consulta?", a: "Você pode agendar diretamente pelo nosso WhatsApp, por telefone, ou preenchendo o formulário de contato no site. Respondemos rapidamente!" },
];

const FAQ = () => {
  const { data: settings } = useSiteSettings();
  const whatsappUrl = getWhatsAppUrl(settings?.whatsapp_number || "5581991360132", settings?.whatsapp_message);

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
              Dúvidas Frequentes
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Tudo o que você precisa saber antes de agendar sua consulta.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="bg-card border border-border/50 rounded-xl px-6 data-[state=open]:shadow-card transition-shadow">
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <p className="text-muted-foreground mb-4">Ainda tem dúvidas? Fale diretamente com a gente!</p>
          <Button size="lg" className="font-bold px-8" style={{ backgroundColor: "#25D366" }} asChild>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5 mr-2" /> Tire suas dúvidas no WhatsApp
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
