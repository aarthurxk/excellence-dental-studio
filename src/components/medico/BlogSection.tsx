import { motion } from "framer-motion";
import SectionDivider from "./SectionDivider";

const blogPosts = [
  { title: "Cuidados com a saúde bucal no inverno", excerpt: "Dicas importantes para manter seus dentes saudáveis durante os meses mais frios.", image: "https://placehold.co/400x260/e2e8f0/94a3b8?text=Blog+1" },
  { title: "Tratamentos estéticos em alta", excerpt: "Conheça os procedimentos odontológicos estéticos mais procurados atualmente.", image: "https://placehold.co/400x260/e2e8f0/94a3b8?text=Blog+2" },
  { title: "A importância da prevenção", excerpt: "Saiba por que consultas regulares ao dentista são fundamentais para sua saúde.", image: "https://placehold.co/400x260/e2e8f0/94a3b8?text=Blog+3" },
];

const BlogSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Novidades & Dicas de Saúde</h2>
          <SectionDivider />
          <p className="text-muted-foreground max-w-2xl mt-4">
            Fique por dentro das últimas novidades em odontologia e dicas de saúde bucal.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map((post, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="group cursor-pointer"
            >
              <div className="overflow-hidden rounded-t">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full aspect-[3/2] object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-6 bg-card border border-t-0 border-border">
                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors mb-2">{post.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{post.excerpt}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
