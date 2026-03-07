import { motion } from "framer-motion";

const videos = [
  { title: "Conheça a Odonto Excellence", youtubeId: "dQw4w9WgXcQ" },
  { title: "Nossos Tratamentos", youtubeId: "dQw4w9WgXcQ" },
];

const Videos = () => {
  return (
    <section className="py-20 bg-clinic-gray">
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
          {videos.map((video, i) => (
            <motion.div
              key={video.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl overflow-hidden border border-border bg-card"
            >
              <div className="aspect-video bg-clinic-dark flex items-center justify-center">
                <p className="text-sm text-clinic-gray/50">Vídeo YouTube</p>
              </div>
              <div className="p-5">
                <h3 className="font-display font-semibold text-foreground">{video.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Videos;
