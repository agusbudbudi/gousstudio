import React from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Briefcase } from 'lucide-react';
import portfolioData from '../data/portfolio.json';
import Portfolio from '../components/Portfolio';
import AnimatedPage from '../ui/AnimatedPage';

const PortfolioPage = () => {
  const location = useLocation();
  const initialTab = location.state?.activeTab || "poster";

  return (
    <AnimatedPage>
      <Helmet>
        <title>Portofolio Project | Gous Studio</title>
        <meta name="description" content="Lihat koleksi lengkap hasil karya desain grafis, logo, dan branding terbaik dari Gous Studio." />
        <meta property="og:title" content="Portofolio Project | Gous Studio" />
        <meta property="og:description" content="Koleksi lengkap hasil karya kreatif Gous Studio untuk berbagai klien." />
      </Helmet>
      <section className="hero-grid-bg relative flex flex-col items-center justify-center px-4 text-center overflow-hidden pt-36 pb-12">
        <div className="blob w-80 h-80 bg-brand-500 top-0 -left-20" style={{ opacity: 0.4 }}></div>
        <div className="blob w-64 h-64 bg-neon top-20 -right-20" style={{ animationDelay: '-6s', opacity: 0.3 }}></div>
        
        <div className="relative z-10 max-w-4xl mx-auto reveal visible">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass neon-border text-xs text-brand-400 font-medium mb-6">
            <Briefcase size={14} /> Our Best Works
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-4 text-white">
            Portofolio <span className="text-gradient">Project</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Koleksi lengkap hasil karya kreatif yang telah kami kerjakan untuk berbagai klien.
          </p>
        </div>
      </section>

      <Portfolio showTitle={false} initialTab={initialTab} isSticky={true} />
    </AnimatedPage>
  );
};

export default PortfolioPage;
