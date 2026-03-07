import Layout from "@/components/layout/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const TeamPage = () => {
  const { data: dentists, isLoading } = useQuery({
    queryKey: ["dentists_all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dentists")
        .select("*")
        .eq("active", true)
        .order("display_order");
      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-14">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Nossa Equipe</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-3">
              Profissionais <span className="text-primary">Especializados</span>
            </h1>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border">
                    <Skeleton className="aspect-[3/4]" />
                    <div className="p-6 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))
              : dentists?.map((d) => (
                  <div key={d.id} className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-all">
                    <div className="aspect-[3/4] bg-gradient-to-br from-primary/5 to-clinic-gray flex items-center justify-center overflow-hidden">
                      {d.photo_url ? (
                        <img src={d.photo_url} alt={d.name} className="w-full h-full object-cover" />
                      ) : (
                        <p className="text-xs text-muted-foreground">Foto</p>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="font-display text-lg font-semibold text-foreground">{d.name}</h3>
                      <p className="text-primary text-sm font-medium mt-1">{d.specialty}</p>
                      <p className="text-xs text-muted-foreground mt-1">{d.cro}</p>
                      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{d.bio}</p>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default TeamPage;
