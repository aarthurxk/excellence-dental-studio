import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import HeroSection from "@/components/medico/HeroSection";
import InfoStrip from "@/components/medico/InfoStrip";
import HighlightBanner from "@/components/medico/HighlightBanner";
import AboutSection from "@/components/medico/AboutSection";
import DepartmentsSection from "@/components/medico/DepartmentsSection";
import DoctorsSection from "@/components/medico/DoctorsSection";
import TestimonialsSection from "@/components/medico/TestimonialsSection";
import BeforeAfter from "@/components/home/BeforeAfter";
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
      <div data-section="hero"><HeroSection /></div>
      <InfoStrip />
      <HighlightBanner />
      <div data-section="sobre"><AboutSection /></div>
      <div data-section="tratamentos"><DepartmentsSection /></div>
      <div data-section="equipe"><DoctorsSection /></div>
      <div data-section="depoimentos"><TestimonialsSection /></div>
      <div data-section="antes-depois"><BeforeAfter /></div>
      <div data-section="videos"><Videos /></div>
      <div data-section="eventos"><Events /></div>
      <CTABanner />
      <div data-section="faq"><FAQ /></div>
      <div data-section="localizacao"><Location /></div>
    </Layout>
  );
};

export default Index;
