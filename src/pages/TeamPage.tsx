import Layout from "@/components/layout/Layout";

const dentists = [
  { name: "Dr. João Silva", specialty: "Implantodontia", cro: "CRO-PE 12345", bio: "Especialista em implantes dentários com mais de 10 anos de experiência." },
  { name: "Dra. Maria Santos", specialty: "Ortodontia", cro: "CRO-PE 67890", bio: "Referência em ortodontia estética e alinhadores invisíveis." },
  { name: "Dr. Carlos Oliveira", specialty: "Endodontia", cro: "CRO-PE 11223", bio: "Especialista em tratamento de canal com técnicas minimamente invasivas." },
  { name: "Dra. Ana Costa", specialty: "Harmonização Facial", cro: "CRO-PE 44556", bio: "Especializada em procedimentos de harmonização orofacial." },
];

const TeamPage = () => {
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
            {dentists.map((d) => (
              <div key={d.name} className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-all">
                <div className="aspect-[3/4] bg-gradient-to-br from-primary/5 to-clinic-gray flex items-center justify-center">
                  <p className="text-xs text-muted-foreground">Foto</p>
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
