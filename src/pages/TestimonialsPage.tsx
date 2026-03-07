import Layout from "@/components/layout/Layout";
import { Star, Quote } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const TestimonialsPage = () => {
  const { data: testimonials, isLoading } = useQuery({
    queryKey: ["testimonials_all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("active", true)
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

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
                      <div className="h-10 w-10 rounded-full bg-clinic-red-light flex items-center justify-center text-primary font-semibold text-sm">
                        {t.patient_name.charAt(0)}
                      </div>
                      <p className="font-medium text-foreground">{t.patient_name}</p>
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
