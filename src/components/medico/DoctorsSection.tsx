import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import SectionDivider from "./SectionDivider";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

const DoctorsSection = () => {
  const autoplayPlugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

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
    <section className="py-12 md:py-20 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-14"
        >
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-3">Nossa Equipe</h2>
          <div className="flex justify-center"><SectionDivider /></div>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4 text-sm md:text-base">
            Conheça os profissionais dedicados que cuidam do seu sorriso.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-sm sm:max-w-none mx-auto">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[3/4] w-full mb-4" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : dentists && dentists.length > 0 ? (
          <div className="px-8 md:px-12">
            <Carousel
              opts={{ loop: true, align: "start" }}
              plugins={[autoplayPlugin.current]}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {dentists.map((doc, i) => (
                  <CarouselItem
                    key={doc.id}
                    className="pl-4 basis-full sm:basis-1/2 md:basis-1/3"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.15 }}
                      className="group text-center"
                    >
                      <div className="relative overflow-hidden mb-0">
                        <img
                          src={doc.photo_url || `https://placehold.co/400x500/e2e8f0/94a3b8?text=${doc.name.charAt(0)}`}
                          alt={doc.name}
                          className="w-full aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute bottom-0 left-0 right-0">
                          <div className="flex">
                            <div className="bg-primary py-3 px-6 flex-1 text-center">
                              <p className="font-bold text-primary-foreground text-sm md:text-base">{doc.name}</p>
                              <p className="text-primary-foreground/80 text-xs md:text-sm">{doc.specialty}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 md:p-6">
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {doc.bio || "Profissional dedicado ao cuidado do seu sorriso."}
                        </p>
                      </div>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-4 md:-left-6" />
              <CarouselNext className="-right-4 md:-right-6" />
            </Carousel>
          </div>
        ) : null}

        <div className="flex justify-center gap-4 mt-8 md:mt-10">
          <Button size="lg" className="rounded font-semibold px-8" asChild>
            <Link to="/equipe">
              <Users className="h-4 w-4 mr-2" />
              TODA A EQUIPE
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DoctorsSection;
