import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { MessageCircle, Smile, Sparkles, Stethoscope, Syringe, ScanFace, ShieldCheck } from "lucide-react";

const services = [
  { icon: Smile, title: "Implantes Dentários", description: "Recupere seu sorriso com implantes de alta qualidade e durabilidade. Utilizamos técnicas modernas para resultados naturais.", benefits: ["Durabilidade", "Estética natural", "Conforto"] },
  { icon: Sparkles, title: "Clareamento Dental", description: "Dentes mais brancos com técnicas seguras e resultados imediatos. Tratamento personalizado para cada paciente.", benefits: ["Resultado rápido", "Seguro", "Duradouro"] },
  { icon: Stethoscope, title: "Ortodontia", description: "Aparelhos convencionais e alinhadores invisíveis para todos os casos. Planejamento digital para tratamento preciso.", benefits: ["Alinhadores invisíveis", "Planejamento digital", "Conforto"] },
  { icon: ScanFace, title: "Harmonização Facial", description: "Procedimentos estéticos para valorizar seu sorriso e rosto. Técnicas minimamente invasivas com resultados naturais.", benefits: ["Naturalidade", "Minimamente invasivo", "Resultados imediatos"] },
  { icon: Syringe, title: "Endodontia", description: "Tratamento de canal com tecnologia avançada e sem dor. Preservação dentária com técnicas de precisão.", benefits: ["Indolor", "Preservação dental", "Tecnologia avançada"] },
  { icon: ShieldCheck, title: "Prevenção", description: "Limpeza, check-up e acompanhamento para manter sua saúde bucal em dia.", benefits: ["Check-up completo", "Limpeza profissional", "Orientação personalizada"] },
];

const ServicesPage = () => {
  return (
    <Layout>
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-14">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Tratamentos</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-3">
              Nossos <span className="text-primary">Tratamentos</span>
            </h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((s) => (
              <div key={s.title} className="bg-card p-8 rounded-2xl border border-border hover:shadow-lg transition-all">
                <div className="flex items-start gap-5">
                  <div className="h-14 w-14 rounded-xl bg-clinic-red-light flex items-center justify-center shrink-0">
                    <s.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-semibold text-foreground mb-2">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{s.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {s.benefits.map((b) => (
                        <span key={b} className="px-3 py-1 text-xs rounded-full bg-clinic-red-light text-primary font-medium">{b}</span>
                      ))}
                    </div>
                    <Button size="sm" asChild className="font-medium">
                      <a
                        href={`https://wa.me/5581991360132?text=Olá! Gostaria de saber mais sobre ${s.title}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Saiba mais
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ServicesPage;
