import React from 'react';
import { Helmet } from 'react-helmet-async';
import AnimatedPage from '../ui/AnimatedPage';
import Hero from '../components/Hero';
import Clients from '../components/Clients';
import Services from '../components/Services';
import Process from '../components/Process';
import Portfolio from '../components/Portfolio';
import Testimonials from '../components/Testimonials';
import FastworkPromo from '../components/FastworkPromo';
import About from '../components/About';
import Contact from '../components/Contact';

const Home = () => (
  <AnimatedPage>
    <Helmet>
      <title>Home | Gous Studio</title>
      <meta name="description" content="Jasa desain grafis profesional, logo, poster, dan manajemen media sosial dari Gous Studio." />
    </Helmet>
    <Hero />
    <Clients />
    <Services />
    <Process />
    <Portfolio limit={9} />
    <Testimonials />
    <FastworkPromo />
    <About />
    <Contact />
  </AnimatedPage>
);

export default Home;
