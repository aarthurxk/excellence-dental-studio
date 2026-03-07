import Layout from "@/components/layout/Layout";
import { Star, Quote } from "lucide-react";

const testimonials = [
  { name: "Maria Fernanda", text: "Excelente atendimento! A equipe é muito profissional e cuidadosa. Meu tratamento de implante foi impecável." },
  { name: "Roberto Almeida", text: "Fiz o clareamento dental e o resultado superou minhas expectativas. Recomendo a todos!" },
  { name: "Juliana Pereira", text: "Ambiente acolhedor e moderno. Me senti muito segura durante todo o tratamento ortodôntico." },
  { name: "Carlos Eduardo", text: "Profissionais excelentes e atenciosos. A clínica tem uma infraestrutura maravilhosa." },
  { name: "Patrícia Lima", text: "Sempre fui muito ansiosa com dentista, mas na Odonto Excellence me sinto tranquila. Equipe incrível!" },
  { name: "Fernando Costa", text: "Fiz meus implantes aqui e estou muito satisfeito com o resultado. Recomendo de olhos fechados." },
];

const TestimonialsPage = () => {
  return (
    <Layout>
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-14">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Depoimentos</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-3">
              O que nossos <span className="text-primary">pacientes</span> dizem
            </h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-card p-8 rounded-2xl border border-border relative">
                <Quote className="h-10 w-10 text-primary/15 absolute top-6 right-6" />
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-clinic-red-light flex items-center justify-center text-primary font-semibold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <p className="font-medium text-foreground">{t.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default TestimonialsPage;
