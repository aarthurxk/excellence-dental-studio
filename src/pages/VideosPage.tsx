import Layout from "@/components/layout/Layout";

const videos = [
  { title: "Conheça a Odonto Excellence", description: "Tour pela nossa clínica e conheça nossa estrutura.", youtubeId: "dQw4w9WgXcQ" },
  { title: "Nossos Tratamentos", description: "Saiba mais sobre os tratamentos que oferecemos.", youtubeId: "dQw4w9WgXcQ" },
  { title: "Depoimento de Paciente", description: "Veja o que nossos pacientes falam sobre nós.", youtubeId: "dQw4w9WgXcQ" },
  { title: "Implantes Dentários", description: "Entenda como funciona o tratamento com implantes.", youtubeId: "dQw4w9WgXcQ" },
];

const VideosPage = () => {
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
            {videos.map((v) => (
              <div key={v.title} className="rounded-2xl overflow-hidden border border-border bg-card">
                <div className="aspect-video bg-clinic-dark flex items-center justify-center">
                  <p className="text-sm text-clinic-gray/50">Vídeo YouTube</p>
                </div>
                <div className="p-5">
                  <h3 className="font-display font-semibold text-foreground">{v.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{v.description}</p>
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
