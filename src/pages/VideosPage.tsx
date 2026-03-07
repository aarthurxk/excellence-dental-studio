import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const VideosPage = () => {
  const { data: videos, isLoading } = useQuery({
    queryKey: ["videos_all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
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
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Vídeos</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-3">
              Nossos <span className="text-primary">Vídeos</span>
            </h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden border border-border bg-card">
                    <Skeleton className="aspect-video" />
                    <div className="p-5 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))
              : videos?.map((v) => (
                  <div key={v.id} className="rounded-2xl overflow-hidden border border-border bg-card">
                    <div className="aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${v.youtube_id}`}
                        title={v.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-display font-semibold text-foreground">{v.title}</h3>
                      {v.description && <p className="text-sm text-muted-foreground mt-1">{v.description}</p>}
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default VideosPage;
