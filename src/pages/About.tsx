import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useSiteSettings, getWhatsAppUrl } from "@/hooks/useSiteSettings";

const AboutPage = () => {
  const { data: settings } = useSiteSettings();
  const { data, isLoading } = useQuery({
    queryKey: ["about_content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("about_content")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      <SEOHead title="Sobre Nós" description="Conheça a história e os diferenciais da Odonto Excellence, clínica odontológica no Ipsep, Recife." path="/sobre" />
      <section className="py-20 bg-background">
        <div className="container max-w-4xl">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Sobre Nós</span>
          {isLoading ? (
            <div className="mt-3 mb-8 space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-3 mb-8">
                {data?.title || "Odonto Excellence – Unidade Ipsep"}
              </h1>
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p>{data?.paragraph_1 || "A Odonto Excellence é uma rede de clínicas odontológicas comprometida com a excelência."}</p>
                {data?.paragraph_2 && <p>{data.paragraph_2}</p>}
                {data?.paragraph_3 && <p>{data.paragraph_3}</p>}
              </div>

              {(data?.stat_years || data?.stat_patients || data?.stat_treatments) && (
                <div className="grid grid-cols-3 gap-6 mt-10">
                  {data?.stat_years && (
                    <div className="text-center">
                      <p className="text-3xl font-bold font-display text-primary">{data.stat_years}</p>
                      <p className="text-sm text-muted-foreground mt-1">Anos de Experiência</p>
                    </div>
                  )}
                  {data?.stat_patients && (
                    <div className="text-center">
                      <p className="text-3xl font-bold font-display text-primary">{data.stat_patients}</p>
                      <p className="text-sm text-muted-foreground mt-1">Pacientes Atendidos</p>
                    </div>
                  )}
                  {data?.stat_treatments && (
                    <div className="text-center">
                      <p className="text-3xl font-bold font-display text-primary">{data.stat_treatments}</p>
                      <p className="text-sm text-muted-foreground mt-1">Tratamentos</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          <div className="mt-10">
            <Button size="lg" asChild className="font-semibold">
              <a
                href={getWhatsAppUrl(settings?.whatsapp_number || "5581991360132", "Olá! Gostaria de saber mais sobre a clínica.")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Fale Conosco
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
