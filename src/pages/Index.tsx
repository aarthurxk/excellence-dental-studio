import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/medico/HeroSection";
import InfoStrip from "@/components/medico/InfoStrip";
import HighlightBanner from "@/components/medico/HighlightBanner";
import AboutSection from "@/components/medico/AboutSection";
import DepartmentsSection from "@/components/medico/DepartmentsSection";
import DoctorsSection from "@/components/medico/DoctorsSection";

import TestimonialsSection from "@/components/medico/TestimonialsSection";
import BlogSection from "@/components/medico/BlogSection";
import Location from "@/components/home/Location";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <InfoStrip />
      <AboutSection />
      <DepartmentsSection />
      <DoctorsSection />
      
      <TestimonialsSection />
      <BlogSection />
      <Location />
    </Layout>
  );
};

export default Index;
