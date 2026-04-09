import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { trackSectionClick } from "@/hooks/useSectionTracking";

const Videos = () => {
  const { data: videos, isLoading } = useQuery({
    queryKey: ["videos_preview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("active", true)
        .order("featured", { ascending: false })
        .order("display_order")
        .limit(2);
      if (error) throw error;
      return data;
    },
  });

  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="container">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Nossos <span className="text-primary">Vídeos</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Acompanhe nossos conteúdos e conheça mais sobre nossos tratamentos.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {isLoading
            ? Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-border bg-card shadow-card">
                  <Skeleton className="aspect-video" />
                  <div className="p-5">
                    <Skeleton className="h-5 w-3/4" />
                  </div>
                </div>
              ))
            : videos?.map((video, i) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="rounded-2xl overflow-hidden border border-border bg-card shadow-card hover:shadow-hover transition-shadow duration-300"
                >
                  <div className="aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.youtube_id}`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-display font-semibold text-foreground">{video.title}</h3>
                    {video.description && (
                      <p className="text-sm text-muted-foreground mt-1">{video.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
        </div>
        <div className="text-center mt-10">
          <Button asChild variant="outline" size="lg" className="font-semibold" onClick={() => trackSectionClick("videos")}>
            <Link to="/videos">
              Ver todos os vídeos <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Videos;
