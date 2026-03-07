import { motion } from "framer-motion";
import { Facebook, Linkedin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import SectionDivider from "./SectionDivider";

const DoctorsSection = () => {
  const { data: dentists, isLoading } = useQuery({
    queryKey: ["dentists_preview"],
    queryFn: async () => {
      const { data, error } = await supabase.from("dentists").select("*").eq("active", true).order("display_order").limit(3);
      if (error) throw error;
      return data;
    },
  });

  return (
    <section className="py-20 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Nossa Equipe</h2>
          <div className="flex justify-center"><SectionDivider /></div>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
            Conheça os profissionais dedicados que cuidam do seu sorriso.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-[3/4] w-full mb-4" />
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ))
            : dentists?.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="group text-center"
                >
                  {/* Photo with overlay */}
                  <div className="relative overflow-hidden mb-0">
                    <img
                      src={doc.photo_url || `https://placehold.co/400x500/e2e8f0/94a3b8?text=${doc.name.charAt(0)}`}
                      alt={doc.name}
                      className="w-full aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Name overlay at bottom */}
                    <div className="absolute bottom-0 left-0 right-0">
                      <div className="flex">
                        <div className="bg-primary py-3 px-6 flex-1 text-center">
                          <p className="font-bold text-primary-foreground">{doc.name}</p>
                          <p className="text-primary-foreground/80 text-sm">{doc.specialty}</p>
                        </div>
                      </div>
                    </div>

                    {/* Social icons on hover */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      className="absolute bottom-16 left-0 right-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                    </motion.div>
                  </div>

                  <div className="p-6">
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">{doc.bio || "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"}</p>
                    <div className="h-0.5 w-12 bg-primary mx-auto mb-4" />
                    <div className="flex justify-center gap-2">
                      {[Facebook, () => <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, Linkedin].map((IconComp, j) => (
                        <motion.a
                          key={j}
                          href="#"
                          whileHover={{ scale: 1.1 }}
                          className="h-9 w-9 rounded bg-primary flex items-center justify-center text-primary-foreground hover:bg-secondary transition-colors"
                        >
                          {typeof IconComp === 'function' && IconComp.length === 0 ? (
                            <IconComp />
                          ) : (
                            // @ts-ignore
                            <IconComp className="h-4 w-4" />
                          )}
                        </motion.a>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
        </div>

        <div className="flex justify-center gap-4 mt-10">
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
