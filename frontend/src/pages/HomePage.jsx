import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import ServicesSection from '@/components/ServicesSection';
import AboutSection from '@/components/AboutSection';
import TechSection from '@/components/TechSection';
import IndustriesSection from '@/components/IndustriesSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

const HomePage = () => {
  return (
    <main className="min-h-screen" data-testid="home-page">
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <TechSection />
      <IndustriesSection />
      <ContactSection />
      <Footer />
    </main>
  );
};

export default HomePage;
