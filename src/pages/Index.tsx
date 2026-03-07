import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import HeroSection from "@/components/medico/HeroSection";
import InfoStrip from "@/components/medico/InfoStrip";
import HighlightBanner from "@/components/medico/HighlightBanner";
import AboutSection from "@/components/medico/AboutSection";
import DepartmentsSection from "@/components/medico/DepartmentsSection";
import DoctorsSection from "@/components/medico/DoctorsSection";
import TestimonialsSection from "@/components/medico/TestimonialsSection";
import Videos from "@/components/home/Videos";
import Events from "@/components/home/Events";
import CTABanner from "@/components/home/CTABanner";
import FAQ from "@/components/home/FAQ";
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
      <Videos />
      <Events />
      <CTABanner />
      <FAQ />
      <Location />
    </Layout>
  );
};

export default Index;
