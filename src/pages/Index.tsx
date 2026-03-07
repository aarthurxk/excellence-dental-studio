import Layout from "@/components/layout/Layout";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import ServicesPreview from "@/components/home/ServicesPreview";
import About from "@/components/home/About";
import Team from "@/components/home/Team";
import Testimonials from "@/components/home/Testimonials";
import Videos from "@/components/home/Videos";
import Events from "@/components/home/Events";
import Location from "@/components/home/Location";
import CTABanner from "@/components/home/CTABanner";

const Index = () => {
  return (
    <Layout>
      <Hero />
      <Features />
      <ServicesPreview />
      <About />
      <Team />
      <Testimonials />
      <Videos />
      <Events />
      <Location />
      <CTABanner />
    </Layout>
  );
};

export default Index;
