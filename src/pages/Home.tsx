import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import ClientMarquee from '../components/landing/ClientMarquee';
import SelectedWork from '../components/landing/SelectedWork';
import ServicesBento from '../components/landing/ServicesBento';
import WhyGous from '../components/landing/WhyGous';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import ProcessSection from '../components/landing/ProcessSection';
import PricingSection from '../components/landing/PricingSection';
import AboutSection from '../components/landing/AboutSection';
import FaqSection from '../components/landing/FaqSection';
import FastworkStrip from '../components/landing/FastworkStrip';
import FinalCta from '../components/landing/FinalCta';
import LandingFooter from '../components/landing/LandingFooter';
import StickyCta from '../components/landing/StickyCta';

const TITLE = 'Jasa Desain Logo & Brand Identity Jakarta | Gous Studio';
const DESCRIPTION =
  'Studio desain grafis di Jakarta: desain logo, brand identity, social media & poster design. 7+ tahun, 100+ klien. Konsultasi gratis via WhatsApp.';

// Opacity-only page transition: a transform here would break `position: fixed` children.
const Home = () => (
  <motion.div
    className="gs min-h-[100dvh]"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Helmet>
      <title>{TITLE}</title>
      <meta name="description" content={DESCRIPTION} />
      <meta property="og:title" content={TITLE} />
      <meta property="og:description" content={DESCRIPTION} />
      <meta property="twitter:title" content={TITLE} />
      <meta property="twitter:description" content={DESCRIPTION} />
      <meta name="theme-color" content="#f7f6f2" />
    </Helmet>
    <LandingNavbar />
    <div id="main" tabIndex={-1} className="outline-none">
      <HeroSection />
      <ClientMarquee />
      <SelectedWork />
      <ServicesBento />
      <WhyGous />
      <TestimonialsSection />
      <ProcessSection />
      <PricingSection />
      <AboutSection />
      <FaqSection />
      <FastworkStrip />
      <FinalCta />
    </div>
    <LandingFooter />
    <StickyCta />
  </motion.div>
);

export default Home;
