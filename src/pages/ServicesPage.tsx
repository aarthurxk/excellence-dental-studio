import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getIconComponent } from "@/lib/icon-map";
import { Skeleton } from "@/components/ui/skeleton";
import { useSiteSettings, getWhatsAppUrl } from "@/hooks/useSiteSettings";

const ServicesPage = () => {
  const { data: settings } = useSiteSettings();
  const { data: services, isLoading } = useQuery({
    queryKey: ["services_all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("active", true)
        .order("display_order");
      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      <SEOHead title="Tratamentos" description="Conheça os tratamentos odontológicos oferecidos pela Odonto Excellence Ipsep: implantes, clareamento, ortodontia e mais." path="/tratamentos" />
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-14">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Tratamentos</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-3">
              Nossos <span className="text-primary">Tratamentos</span>
            </h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-card p-8 rounded-2xl border border-border">
                    <div className="flex items-start gap-5">
                      <Skeleton className="h-14 w-14 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    </div>
                  </div>
                ))
              : services?.map((s) => {
                  const Icon = getIconComponent(s.icon);
                  return (
                    <div key={s.id} className="bg-card p-8 rounded-2xl border border-border hover:shadow-lg transition-all">
                      <div className="flex items-start gap-5">
                        <div className="h-14 w-14 rounded-xl bg-clinic-red-light flex items-center justify-center shrink-0">
                          <Icon className="h-7 w-7 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display text-xl font-semibold text-foreground mb-2">{s.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-4">{s.description}</p>
                          {s.benefits && s.benefits.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {s.benefits.map((b) => (
                                <span key={b} className="px-3 py-1 text-xs rounded-full bg-clinic-red-light text-primary font-medium">{b}</span>
                              ))}
                            </div>
                          )}
                          <Button size="sm" asChild className="font-medium">
                            <a
                              href={getWhatsAppUrl(settings?.whatsapp_number || "5581991360132", `Olá! Gostaria de saber mais sobre ${s.title}.`)}
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
                  );
                })}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ServicesPage;
