import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import HeroSection from "@/components/medico/HeroSection";
import InfoStrip from "@/components/medico/InfoStrip";
import HighlightBanner from "@/components/medico/HighlightBanner";
import AboutSection from "@/components/medico/AboutSection";
import DepartmentsSection from "@/components/medico/DepartmentsSection";
import DoctorsSection from "@/components/medico/DoctorsSection";

import TestimonialsSection from "@/components/medico/TestimonialsSection";

import Location from "@/components/home/Location";

const Index = () => {
  return (
    <Layout>
      <SEOHead
        title="Odonto Excellence Ipsep | Dentista em Recife"
        description="Clínica odontológica no Ipsep, Recife. Implantes, clareamento, ortodontia e mais. Agende sua avaliação!"
        path="/"
      />
      <HeroSection />
      <InfoStrip />
      <HighlightBanner />
      <AboutSection />
      <DepartmentsSection />
      <DoctorsSection />
      
      <TestimonialsSection />
      
      <Location />
    </Layout>
  );
};

export default Index;
