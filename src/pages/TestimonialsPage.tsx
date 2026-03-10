import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Star, Quote, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const TestimonialsPage = () => {
  const { data: settings } = useSiteSettings();

  const { data: testimonials, isLoading } = useQuery({
    queryKey: ["testimonials_all_5stars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("active", true)
        .eq("rating", 5)
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      <SEOHead title="Depoimentos" description="Veja o que nossos pacientes dizem sobre a Odonto Excellence Ipsep." path="/depoimentos" />
      <section className="py-20 bg-background">
        <div className="container">
          {/* Google Reviews Header */}
          <div className="text-center mb-14">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Depoimentos</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-3">
              O que nossos <span className="text-primary">pacientes</span> dizem
            </h1>
            <div className="flex justify-center items-center gap-2 mt-5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="font-bold text-foreground ml-1">4.9</span>
              <span className="text-muted-foreground text-sm">/ 5.0 — Google Reviews</span>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
              Avaliações reais de pacientes que transformaram seus sorrisos conosco.
            </p>
            {settings?.google_reviews_url && (
              <Button className="mt-5 rounded font-semibold" asChild>
                <a href={settings.google_reviews_url} target="_blank" rel="noopener noreferrer">
                  <Star className="h-4 w-4 mr-2 fill-current" />
                  Avaliar no Google
                  <ExternalLink className="h-3.5 w-3.5 ml-2" />
                </a>
              </Button>
            )}
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-card p-8 rounded-2xl border border-border">
                    <Skeleton className="h-4 w-24 mb-4" />
                    <Skeleton className="h-20 w-full mb-6" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                ))
              : testimonials?.map((t) => (
                  <div key={t.id} className="bg-card p-8 rounded-2xl border border-border relative">
                    <Quote className="h-10 w-10 text-primary/15 absolute top-6 right-6" />
                    <div className="flex gap-1 mb-4">
                      {[...Array(t.rating)].map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-6 italic">"{t.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                        {t.patient_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{t.patient_name}</p>
                        <p className="text-xs text-green-600 font-medium">Avaliação Google ✓</p>
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

export default TestimonialsPage;
